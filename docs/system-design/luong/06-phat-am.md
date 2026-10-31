# Luyện phát âm

Module backend: `speaking` (dùng `ai`). Màn: `/study/pronunciation`, `/study/pronunciation/[lessonId]`.

| Danh sách câu luyện                     | Luyện một câu                           |
| --------------------------------------- | --------------------------------------- |
| ![Danh sách](../images/18-phat-am.webp) | ![Luyện](../images/19-phat-am-bai.webp) |

Người học đọc to một câu mẫu. Hệ thống chấm độ chính xác, độ trôi chảy, độ đầy đủ, ngữ điệu và điểm phát âm tổng, tới
từng từ.

## Luồng ghi âm và chấm

Ghi âm cần ba lời gọi thay vì một lần upload: audio đi **thẳng từ trình duyệt lên object storage**, không qua web, BFF
hay backend.

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as SpeakingService
    participant S3 as Object storage<br/>bucket speaking
    participant Q as ai_jobs
    participant K as AiJobWorker
    participant H as SpeechAssessmentHandler
    participant AI as ai_service

    U->>W: bấm ghi âm, đọc câu, dừng
    W->>F: mutation StartSpeakingAttempt
    F->>A: POST /api/speaking/prompts/{id}/attempts
    A->>A: tạo speaking_attempts (AWAITING_UPLOAD)
    A-->>W: attemptId + presigned PUT URL<br/>(gắn đúng kích thước khai báo, hạn 15 phút)
    W->>S3: PUT audio
    W->>F: mutation SubmitSpeakingAttempt
    F->>A: POST /api/speaking/attempts/{id}/submit
    A->>S3: kiểm tra file đã có thật
    A->>A: kiểm tra hạn mức AI trong ngày
    A->>Q: INSERT job SPEECH_ASSESSMENT
    A->>A: attempt -> QUEUED
    A-->>W: QUEUED
    Q-->>K: sau commit, đánh thức worker
    K->>H: run(job)
    H->>S3: tải audio
    H->>AI: POST /internal/v1/speech/assess (audio, câu mẫu)
    AI-->>H: điểm tổng + điểm từng từ, âm vị
    H->>A: ghi điểm, speaking_attempt_words -> ASSESSED
    loop mỗi vài giây
        W->>F: query SpeakingAttempt
        F->>A: GET /api/speaking/attempts/{id}
        A-->>W: QUEUED ... rồi ASSESSED kèm điểm
    end
```

Polling thay vì giữ kết nối: một người chờ vài giây để có một điểm không đáng để giữ, cân bằng tải và nối lại một
socket.

```mermaid
stateDiagram-v2
    [*] --> AWAITING_UPLOAD : mở lượt, cấp URL upload
    AWAITING_UPLOAD --> QUEUED : báo đã upload, file có thật
    AWAITING_UPLOAD --> [*] : không bao giờ upload,<br/>SpeakingUploadCleanup dọn định kỳ mỗi giờ
    QUEUED --> ASSESSED : job thành công
    QUEUED --> FAILED : job bỏ cuộc (error_code ghi lý do)
    ASSESSED --> [*]
    FAILED --> [*]
```

## Kết quả

| Chỉ số                   | Ý nghĩa                                             |
| ------------------------ | --------------------------------------------------- |
| `accuracy_percent`       | Phát âm đúng từng âm                                |
| `fluency_percent`        | Trôi chảy, ngắt nghỉ                                |
| `completeness_percent`   | Đọc đủ các từ trong câu mẫu                         |
| `prosody_percent`        | Ngữ điệu, trọng âm                                  |
| `pronunciation_percent`  | Điểm tổng                                           |
| `recognized_text`        | Câu hệ thống nghe được                              |
| `speaking_attempt_words` | Điểm và loại lỗi của từng từ (đọc sai, thiếu, thừa) |

Với nhà cung cấp Azure, các chỉ số trên là điểm chấm thật tới âm vị. Với Whisper, fluency và pronunciation là ước lượng
(xem [6. AI](../06-ai.md#hai-nhà-cung-cấp-chấm-phát-âm)).
