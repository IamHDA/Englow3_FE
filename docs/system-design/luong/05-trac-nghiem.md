# Trắc nghiệm

Module backend: `quiz`. Màn: tab "Thử thách trắc nghiệm" trong `/study/daily-path` và `/study/quiz/[quizId]`.

![Làm trắc nghiệm](../images/24-trac-nghiem.webp)

## Năm dạng câu hỏi

| Dạng              | Người học làm gì                 | Dữ liệu đáp án                                  |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| `MULTIPLE_CHOICE` | Chọn một đáp án                  | `quiz_question_options`                         |
| `FILL_BLANK`      | Điền từ vào chỗ trống            | Token `ACCEPTED_ANSWER` (nhiều cách viết đúng)  |
| `REWRITE`         | Viết lại câu bằng các từ cho sẵn | Token `WORD_BANK`, `CORRECT_WORD`               |
| `REORDER`         | Sắp xếp các mảnh thành câu đúng  | Token `SCRAMBLED`, `CORRECT_ORDER`              |
| `MATCHING`        | Nối vế trái với vế phải          | `quiz_question_pairs`, trộn theo thứ tự cố định |

`QuizGrader` là hàm thuần chấm cả năm dạng, so sánh không phân biệt hoa thường và gộp khoảng trắng: gõ đúng từ là
đúng, không bắt người học khớp cả cách viết hoa hay dấu cách.

## Luồng làm bài

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as QuizService
    participant G as QuizGrader (hàm thuần)
    participant D as PostgreSQL

    U->>W: chọn bài
    W->>F: mutation StartQuiz
    F->>A: POST /api/quizzes/{id}/attempts
    alt đã có lượt đang làm
        A-->>F: 200 + lượt cũ (làm tiếp)
    else chưa có
        A->>D: INSERT quiz_attempts (IN_PROGRESS, expires_at)
        A-->>F: 201 + lượt mới
    end
    W->>F: query QuizPaper
    F->>A: GET /api/quiz-attempts/{id}/paper
    A-->>W: đề KHÔNG kèm đáp án
    U->>W: trả lời, bấm nộp
    W->>F: mutation SubmitQuiz
    F->>A: POST /api/quiz-attempts/{id}/submit
    A->>G: chấm từng câu
    A->>D: lưu câu trả lời, điểm, % và đạt/không đạt
    A-->>W: kết quả
    W->>F: query QuizResult
    F->>A: GET /api/quiz-attempts/{id}/result
    A-->>W: đáp án đúng, giải thích từng câu
```

```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS : bắt đầu, expires_at = bắt đầu + thời gian làm bài
    IN_PROGRESS --> SCORED : nộp trước expires_at
    SCORED --> [*]
```

Sau `expires_at`, server từ chối cả lấy đề lẫn nộp bài (`QUIZ_ATTEMPT_EXPIRED`). Vì vậy web tự nộp ngay khi đồng hồ về 0. Enum có trạng thái `EXPIRED` nhưng luồng hiện tại không chuyển lượt nào sang đó.

- **Đạt** khi phần trăm điểm từ `passing_score_percent` của bài trở lên. Ngưỡng là phần trăm chứ không phải điểm thô,
  nên thêm câu vào bài không làm lệch ngưỡng.
- **Đề và đáp án là hai bản khác nhau.** Đề gửi lúc đang làm không chứa đáp án; mỗi đối tượng (người làm bài, người xem
  kết quả, người soạn) nhận một bản dữ liệu riêng, không phải một bản chung bị xoá bớt trường.
- Sau khi có kết quả, người học có thể hỏi [gia sư AI](09-gia-su-ai.md) về một câu cụ thể; gia sư nhận ngữ cảnh câu đó qua
  `quiz.api.SubmittedQuizContextReader`.
