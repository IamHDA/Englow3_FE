# Gia sư AI

Module backend: `tutor` (dùng `ai`). Màn: `/ai-tutor`. Khu quản trị: `/admin/ai-tutor`.

![Gia sư AI](../images/29-gia-su-ai.webp)

Người học hỏi bằng chữ hoặc giọng nói về tiếng Anh, có thể gắn câu hỏi với một câu trắc nghiệm, một câu thi hoặc một bài
Viết/Nói đã chấm. Gia sư trả lời bằng LLM, có trích dẫn tài liệu tham khảo đã được duyệt.

## Nguyên tắc: hỏi đồng bộ, trả lời bất đồng bộ

Câu hỏi được **lưu trước khi hỏi bất kỳ nhà cung cấp nào**, nên nhà cung cấp lỗi cũng không làm mất điều người học đã
gõ. Câu trả lời đến sau qua hàng đợi AI.

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant T as TutorService
    participant Q as ai_jobs
    participant H as TutorReplyHandler
    participant AI as ai_service

    U->>W: gõ câu hỏi, gửi
    W->>F: mutation AskTutor { clientId, conversationId?, text, ngữ cảnh? }
    F->>T: POST /api/tutor/messages
    T->>T: kiểm tra hạn mức AI trong ngày
    T->>T: lưu câu hỏi (USER) + câu trả lời chờ (ASSISTANT, PENDING)<br/>và biên nhận theo clientId
    T->>Q: INSERT job TUTOR_REPLY
    T-->>W: conversationId, messageId
    Q-->>H: worker làn tutor nhận job
    H->>T: lấy lịch sử, trình độ, mục tiêu,<br/>ngữ cảnh bài làm, tài liệu liên quan
    H->>AI: /llm/stream hoặc /llm/generate
    alt streaming bật
        W->>F: GET /api/tutor/stream (SSE qua web và BFF)
        F->>T: GET /api/tutor/conversations/{id}/messages/{mid}/events
        AI-->>H: từng đoạn văn bản
        H->>T: ghi phần đã có (stream_epoch)
        T-->>W: sự kiện SSE, chữ hiện dần
    else không stream
        loop polling
            W->>F: query TutorRequest(clientId)
            F->>T: GET /api/tutor/requests/{clientId}
        end
    end
    H->>T: câu trả lời đầy đủ, nguồn trích dẫn -> READY
    T-->>W: câu trả lời
```

Gửi lại cùng `clientId` (ví dụ mạng chập chờn khiến trình duyệt gửi hai lần) trả về đúng lượt đã tạo, không tạo câu
hỏi trùng.

```mermaid
stateDiagram-v2
    [*] --> PENDING : câu hỏi đã lưu, job đã xếp
    PENDING --> READY : có câu trả lời
    PENDING --> FAILED : job bỏ cuộc
    PENDING --> CANCELLED : người học bấm dừng
    FAILED --> PENDING : thử lại
    READY --> PENDING : tạo lại câu trả lời (bản mới)
    READY --> [*]
```

## Những gì gia sư được biết

```mermaid
flowchart LR
    reply["TutorReplyHandler"] --> hist["Lịch sử hội thoại<br/>(trừ các bản tóm tắt)"]
    reply --> profile["Trình độ, mục tiêu<br/>qua user.api"]
    reply --> quizctx["Câu trắc nghiệm đã chấm<br/>quiz.api.SubmittedQuizContextReader"]
    reply --> examctx["Câu thi đã chấm, đoạn văn liên quan<br/>exam.api.SubmittedExamContextReader"]
    reply --> asmctx["Bài Viết/Nói đã chấm<br/>assessment.api.SubmittedAssessmentContextReader"]
    reply --> kb["Tài liệu tham khảo đã xuất bản<br/>full-text search trên tutor_resources"]
    reply --> mem["Ghi nhớ hội thoại<br/>tutor_memories (nếu bật)"]
```

- Mỗi module sở hữu dữ liệu tự kiểm tra **người hỏi là chủ bài làm và bài đã được chấm** trước khi đưa ngữ cảnh ra. Ngữ
  cảnh không chứa URL media riêng tư, điểm tiêu chí ẩn hay ghi chú riêng của người chấm.
- Hồ sơ và nội dung tài liệu được đặt trong phần ngữ cảnh không tin cậy, không bao giờ nằm trong chỉ dẫn hệ thống.
- Trích dẫn giữ đúng phiên bản tài liệu tại thời điểm trả lời, kể cả khi tài liệu được sửa sau đó.

## Các thao tác khác

| Thao tác                         | API                                                         |
| -------------------------------- | ----------------------------------------------------------- |
| Thử lại, tạo lại, dừng           | `POST .../messages/{mid}/retry`, `/regenerate`, `/cancel`   |
| Xem và chọn các bản trả lời      | `GET .../messages/{mid}/versions`, `POST .../select`        |
| Rẽ nhánh hội thoại từ một câu    | `POST .../messages/{mid}/branch`                            |
| Báo cáo câu trả lời sai          | `POST /api/tutor/conversations/{cid}/messages/{mid}/report` |
| Tóm tắt, xoá ghi nhớ             | `POST .../memory/summarize`, `DELETE .../memory`            |
| Lượng dùng trong ngày            | `GET /api/tutor/usage`                                      |
| Xuất, xoá toàn bộ dữ liệu gia sư | `GET /api/tutor/data/export`, `DELETE /api/tutor/data`      |

Sửa một câu hỏi đã gửi sẽ tạo hội thoại mới thay vì viết đè lịch sử.

## Hỏi bằng giọng nói

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant T as Backend tutor<br/>(qua /api/tutor/audio và BFF)
    participant Q as ai_jobs
    participant AI as ai_service

    U->>W: ghi âm câu hỏi
    W->>T: POST /api/tutor/recordings (WAV, giới hạn kích thước)
    T->>Q: job TUTOR_TRANSCRIPTION
    Q->>AI: /speech/assess - chép lời
    AI-->>T: văn bản
    W->>T: GET /api/tutor/recordings/requests/{clientMessageId}
    T-->>W: bản chép lời
    U->>W: sửa nếu cần, bấm gửi
    W->>T: hỏi như câu hỏi gõ tay
```

Bản chép lời **không tự thành câu hỏi**: người học phải xác nhận. File ghi âm tự xoá sau 24 giờ.

## Quản trị

| Vai trò | Được làm                                                                                                               |
| ------- | ---------------------------------------------------------------------------------------------------------------------- |
| Staff   | Soạn tài liệu tham khảo, gửi duyệt; xử lý báo cáo được giao                                                            |
| Admin   | Xuất bản, rút tài liệu; xem số liệu vận hành (độ trễ p95, mã lỗi, token); chỉnh chính sách (`/api/admin/tutor/policy`) |

Staff không bao giờ nhận được danh sách hội thoại của người học; chỉ thấy câu trả lời bị báo cáo được giao cho mình. Số
liệu vận hành không chứa nội dung câu hỏi hay câu trả lời.

![Quản trị gia sư AI](../images/46-admin-gia-su-ai.webp)

Stream, ghi âm và ghi nhớ mặc định **tắt**, bật bằng `TUTOR_STREAMING_ENABLED`, `TUTOR_VOICE_ENABLED`,
`TUTOR_MEMORY_ENABLED` (xem `docs/tutor-release-runbook.md` của backend).
