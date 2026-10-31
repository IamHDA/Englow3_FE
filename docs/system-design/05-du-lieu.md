# 5. Dữ liệu

PostgreSQL 17 (image `pgvector/pgvector`), schema quản lý bằng Flyway (`V001` đến `V072`). Khoá chính là UUID, trừ vài bảng danh mục như `learning_purposes` dùng số tự tăng. Mỗi bảng có đúng
một module được ghi; sơ đồ dưới nhóm bảng theo module sở hữu.

Sơ đồ chỉ ghi các cột quan trọng để hiểu luồng, không phải toàn bộ cột.

## Người dùng và gói dịch vụ (`user`, `subscription`)

```mermaid
erDiagram
    users ||--o| learner_profiles : "có"
    users ||--o{ user_learning_purposes : "chọn"
    learning_purposes ||--o{ user_learning_purposes : ""
    users ||--o{ user_target_skills : "chọn"
    users ||--o{ user_tour_completions : "đã xem"
    users ||--o| user_subscriptions : "dùng gói"

    users {
        uuid id PK
        string auth_provider_id "sub trong JWT của Supabase"
        string email
        string role "LEARNER, STAFF, ADMIN"
        string display_name
        string onboarding_step
    }
    learner_profiles {
        uuid id PK
        uuid user_id FK
        string current_level "A1..C2"
        string target_certificate_type "IELTS, TOEIC"
        decimal target_score
        date target_date
        uuid placement_attempt_id "lượt thi xếp lớp, không phải FK JPA"
    }
    learning_purposes {
        int id PK
        string purpose_code
        string display_name
    }
    user_subscriptions {
        uuid user_id PK
        string plan "FREE, PRO"
        string billing_period "MONTHLY, YEARLY"
        timestamp current_period_end "hết hạn thì tự về FREE"
        string source "MANUAL, GATEWAY"
    }
```

Khi một tài khoản được tạo trên Supabase, trigger `V024` tự tạo dòng `users` tương ứng. Khi Admin đổi
`users.role`, trigger `V026` chép role sang `app_metadata` của Supabase để role nằm trong JWT.

## Học và luyện tập (`flashcard`, `dictation`, `quiz`)

```mermaid
erDiagram
    flashcard_sets ||--o{ flashcards : "chứa"
    flashcards ||--o{ flashcard_reviews : "lịch ôn mỗi người"
    flashcards ||--o{ flashcard_review_logs : "lịch sử"

    dictation_lessons ||--o{ dictation_sentences : "chứa"
    dictation_sentences ||--o{ dictation_attempts : "lượt chép"

    quizzes ||--o{ quiz_questions : "chứa"
    quiz_questions ||--o{ quiz_question_options : ""
    quiz_questions ||--o{ quiz_question_tokens : ""
    quiz_questions ||--o{ quiz_question_pairs : ""
    quizzes ||--o{ quiz_attempts : "lượt làm"
    quiz_attempts ||--o{ quiz_attempt_answers : ""

    flashcard_sets {
        uuid id PK
        string name
        string topic
        string target_level
        string status "DRAFT..ARCHIVED"
    }
    flashcard_reviews {
        uuid id PK
        uuid user_id
        uuid flashcard_id FK
        string status "NEW, LEARNING, REVIEW, MASTERED"
        int repetitions
        decimal ease_factor "bắt đầu 2.5, tối thiểu 1.3"
        int interval_days
        timestamp due_at
    }
    dictation_sentences {
        uuid id PK
        string text
        string translation_vi
        string audio_object_key
        int audio_start_ms
        int audio_end_ms
    }
    dictation_attempts {
        uuid id PK
        uuid user_id
        string response
        decimal accuracy_percent
        int correct_word_count
    }
    quiz_questions {
        uuid id PK
        string type "MULTIPLE_CHOICE, FILL_BLANK, REWRITE, REORDER, MATCHING"
    }
    quiz_attempts {
        uuid id PK
        uuid user_id
        string status "IN_PROGRESS, SCORED, EXPIRED"
        decimal score_percentage
        boolean passed
    }
```

`quiz_question_tokens` giữ các mảnh chữ theo vai trò (`ACCEPTED_ANSWER`, `WORD_BANK`, `SCRAMBLED`, `CORRECT_ORDER`, ...)
nên năm dạng câu hỏi dùng chung một cấu trúc.

## Đề thi (`exam`)

```mermaid
erDiagram
    exams ||--o{ exam_sections : "Listening, Reading, ..."
    exam_sections ||--o{ section_parts : "Part 1, 2, ..."
    section_parts ||--o{ question_sets : "nhóm câu dùng chung đoạn văn/audio"
    question_sets ||--o{ questions : ""
    question_sets ||--o{ question_set_options : "lựa chọn dùng chung"
    questions ||--o{ question_options : ""
    questions ||--o{ question_accepted_answers : "đáp án điền từ"
    questions ||--o{ question_matching_answers : "đáp án nối"

    exams ||--o{ exam_attempts : "lượt thi"
    exam_attempts ||--o| exam_attempt_drafts : "bản nháp mới nhất"
    exam_attempts ||--o{ exam_attempt_parts : "phần đã chọn (luyện tập)"
    exam_attempts ||--o{ attempt_section_results : "điểm từng phần"
    exam_attempts ||--o{ attempt_answers : ""
    attempt_answers ||--o{ attempt_answer_options : ""

    exams {
        uuid id PK
        string exam_type "PLACEMENT, MOCK"
        string certificate_type "IELTS, TOEIC"
        string certificate_variant "LR, SW, ACADEMIC, GENERAL"
        int duration_seconds
        string status "DRAFT..ARCHIVED"
        int version_number
    }
    exam_attempts {
        uuid id PK
        uuid user_id
        string mode "FULL, PRACTICE"
        string status "IN_PROGRESS, SCORED, EXPIRED"
        timestamp expires_at
        timestamp last_seen_at "heartbeat"
        decimal raw_score
        decimal converted_score "theo score_conversions"
        string assessed_level "cho bài xếp lớp"
    }
    questions {
        uuid id PK
        string question_type "SINGLE_CHOICE, MULTIPLE_CHOICE, ..."
        string skill_type
        string difficulty_level
        decimal max_raw_score
    }
```

`score_conversions` đổi điểm thô sang thang điểm của chứng chỉ (band IELTS, điểm TOEIC). `grading_criteria` và
`attempt_answer_criterion_scores` đã có bảng nhưng luồng hiện tại chưa dùng.

## Luyện nói, viết và AI (`speaking`, `assessment`, `ai`)

```mermaid
erDiagram
    speaking_prompts ||--o{ speaking_attempts : ""
    speaking_attempts ||--o{ speaking_attempt_words : "điểm từng từ"
    assessment_tasks ||--o{ assessment_attempts : ""
    assessment_attempts ||--o{ assessment_reviews : "chấm tay, sửa điểm"
    assessment_attempts ||--o{ assessment_result_reads : "đã đọc báo cáo"
    users ||--o{ ai_jobs : "requested_by"

    speaking_attempts {
        uuid id PK
        string status "AWAITING_UPLOAD, QUEUED, ASSESSED, FAILED"
        string audio_object_key
        decimal accuracy_percent
        decimal fluency_percent
        decimal pronunciation_percent
        string recognized_text
    }
    assessment_tasks {
        uuid id PK
        string skill "WRITING, SPEAKING"
        string status "DRAFT..ARCHIVED"
        int minimum_words
        int time_limit_seconds
    }
    assessment_attempts {
        uuid id PK
        string skill "WRITING, SPEAKING"
        jsonb task_snapshot "chụp đề lúc bắt đầu"
        text answer_text
        string audio_object_key "chỉ có với SPEAKING"
        string status "DRAFT, QUEUED, NEEDS_REVIEW, COMPLETED, FAILED"
        jsonb report "4 tiêu chí + nhận xét"
        int grading_revision "chặn kết quả cũ"
    }
    ai_jobs {
        uuid id PK
        string job_type "SPEECH_ASSESSMENT, PRODUCTIVE_ASSESSMENT, TUTOR_REPLY, TUTOR_TRANSCRIPTION"
        string target_type
        uuid target_id
        string status "PENDING, RUNNING, SUCCEEDED, FAILED"
        int retry_count
        timestamp next_retry_at
        string idempotency_key
        string queue_scope "môi trường"
    }
```

## Gia sư AI (`tutor`)

```mermaid
erDiagram
    tutor_conversations ||--o{ tutor_messages : ""
    tutor_messages ||--o{ tutor_reply_versions : "các bản trả lời"
    tutor_messages ||--o{ tutor_reports : "báo cáo câu trả lời sai"
    tutor_conversations ||--o{ tutor_requests : "biên nhận theo clientId"
    tutor_conversations ||--o{ tutor_memories : "tóm tắt hội thoại"

    tutor_conversations {
        uuid id PK
        uuid user_id
        boolean use_learning_context
        uuid quiz_attempt_id "ngữ cảnh: câu trắc nghiệm"
        uuid exam_attempt_id "ngữ cảnh: câu thi"
        uuid assessment_attempt_id "ngữ cảnh: bài Viết/Nói"
    }
    tutor_messages {
        uuid id PK
        string role "USER, ASSISTANT"
        string status "PENDING, READY, FAILED, CANCELLED"
        text content
        int revision
        int stream_epoch
        json sources_json "trích dẫn tài liệu"
    }
```

Bảng khác của module: `tutor_resources` (tài liệu tham khảo đã duyệt), `tutor_recordings` (ghi âm WAV, xoá sau 24 giờ),
`tutor_policy` (cấu hình bật/tắt), `tutor_audit`, `tutor_deleted_requests`.

## Object storage

| Bucket     | Quyền     | Chứa                                  | Module sở hữu khoá                |
| ---------- | --------- | ------------------------------------- | --------------------------------- |
| `exams`    | Riêng tư  | Audio, ảnh của đề thi                 | `exam`                            |
| `learning` | Riêng tư  | Audio flashcard, audio bài chính tả   | `flashcard`, `dictation`          |
| `speaking` | Riêng tư  | Bản ghi luyện phát âm, Nói, gia sư AI | `speaking`, `assessment`, `tutor` |
| `avatars`  | Công khai | Ảnh đại diện, ảnh bìa                 | `user`                            |

Cơ sở dữ liệu chỉ lưu khoá tương đối (`audio_object_key`). Backend cấp URL có chữ ký, thời hạn ngắn, để trình duyệt
tải hoặc upload trực tiếp; file không đi qua backend.
