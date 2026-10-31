# Thi thử

Module backend: `exam`. Màn: `/exams` (thư viện đề), `/exams/[id]` (tổng quan và phòng thi).

| Thư viện đề                            | Tổng quan đề                                    |
| -------------------------------------- | ----------------------------------------------- |
| ![Thư viện](../images/27-thi-thu.webp) | ![Tổng quan](../images/28-thi-thu-lam-bai.webp) |

## Cấu trúc một đề

```mermaid
flowchart LR
    exam["Đề<br/>IELTS / TOEIC, thời gian, thang điểm"] --> section["Phần (section)<br/>Listening, Reading, Writing, Speaking"]
    section --> part["Part<br/>Part 1, Part 2, ..."]
    part --> qset["Nhóm câu<br/>dùng chung đoạn văn, audio, lựa chọn"]
    qset --> q["Câu hỏi<br/>một/nhiều lựa chọn, điền từ, nối"]
```

- Loại đề: `MOCK` (thi thử) và `PLACEMENT` (xếp lớp khi onboarding).
- Biến thể chứng chỉ: TOEIC `LR` (nghe đọc), `SW` (nói viết); IELTS `ACADEMIC`, `GENERAL`.
- `score_conversions` đổi điểm thô sang thang điểm chứng chỉ (band IELTS, điểm TOEIC).

## Hai chế độ làm bài

| Chế độ     | Làm gì                                                  | Thời gian                      |
| ---------- | ------------------------------------------------------- | ------------------------------ |
| `FULL`     | Cả đề, như thi thật                                     | Thời gian của đề, có heartbeat |
| `PRACTICE` | Chọn một số part (lấy từ `GET /api/exams/{id}/outline`) | Người học tự chọn              |

Mỗi người chỉ có **một lượt đang mở cho mỗi đề và mỗi chế độ**. Lượt `FULL` và `PRACTICE` của cùng một đề mở song song
được; mở lại một chế độ không ảnh hưởng chế độ kia.

## Luồng làm bài

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as ExamAttemptService
    participant D as PostgreSQL
    participant J as ExamDeadlineWorker

    U->>W: "Bắt đầu thi"
    W->>F: mutation StartExam { mode, parts }
    F->>A: POST /api/exams/{id}/attempts
    A->>D: tạo exam_attempts (IN_PROGRESS, expires_at)<br/>hoặc trả lượt đang mở
    W->>F: query ExamPaper
    F->>A: GET /api/exam-attempts/{id}/paper
    A-->>W: đề an toàn (không đáp án), URL media có chữ ký
    W->>F: query ExamDraft
    F->>A: GET /api/exam-attempts/{id}/draft
    A-->>W: câu đã trả lời trước đó (nếu mở lại)
    par trong lúc làm bài
        loop khi đổi câu trả lời
            W->>F: mutation SaveExamDraft { answers, revision }
            F->>A: PUT /api/exam-attempts/{id}/draft
            A->>D: khoá lượt thi, kiểm tra còn giờ và revision,<br/>thay bản nháp
        end
    and chỉ chế độ FULL
        loop định kỳ
            W->>F: heartbeat
            F->>A: POST /api/exam-attempts/{id}/heartbeat
            A->>D: cập nhật last_seen_at
        end
    end
    alt người học nộp bài
        U->>W: "Nộp bài"
        W->>F: mutation SubmitExam
        F->>A: POST /api/exam-attempts/{id}/submit
    else hết giờ hoặc rời phòng thi quá 2 phút
        J->>D: tìm lượt quá hạn (mỗi 10 giây)
        J->>A: chốt lượt, chỉ chấm bản nháp cuối cùng đã được nhận
    end
    A->>A: chấm từng câu, cộng điểm từng phần,<br/>đổi điểm thô theo score_conversions
    A->>D: SCORED, điểm, attempt_answers
    opt đề PLACEMENT, chế độ FULL
        A->>A: user.api.PlacementRecorder ghi trình độ
    end
    W->>F: query ExamResult
    F->>A: GET /api/exam-attempts/{id}/result
    A-->>W: điểm, đáp án, giải thích
```

```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS : bắt đầu
    IN_PROGRESS --> SCORED : nộp bài
    IN_PROGRESS --> SCORED : hết giờ, worker chốt bản nháp cuối
    IN_PROGRESS --> SCORED : FULL mất heartbeat quá 2 phút
    SCORED --> [*]
```

Enum có thêm `EXPIRED`, nhưng luồng hiện tại không dùng: lượt quá hạn luôn được chốt và chấm thành `SCORED`.

## Quy tắc chống gian lận và mất bài

- **Giờ do server tính.** Bản nháp gửi sau `expires_at` bị từ chối; câu trả lời đến muộn không bao giờ vào bài được chấm.
- **Bản nháp có revision.** Mỗi lần lưu khoá lượt thi và kiểm tra revision, nên hai tab cùng làm không ghi đè lẫn nhau.
- **Tắt trình duyệt vẫn được chấm.** Worker chạy mỗi 10 giây chấm bản nháp cuối cùng của lượt đã hết giờ. Đọc kết quả của
  một lượt đã hết giờ cũng tự chốt lượt đó.
- **Rời phòng thi.** Lượt `FULL` không còn heartbeat quá 2 phút bị coi là đã kết thúc; lưu nháp không thể "hồi sinh" lượt
  đó.
- **Xem trước không bắt đầu tính giờ.** `GET /api/exams/{id}/active-attempts` chỉ đọc, không mở lượt mới.

## Soạn đề

Staff soạn đề trong `/admin/exams` (API `/api/admin/exams`, cấu trúc đề đầy đủ qua `/authoring`), tìm câu có sẵn trong
ngân hàng câu hỏi (`/api/admin/question-bank`). Đề đi qua quy trình [soạn và duyệt](10-soan-duyet-noi-dung.md); khi
xuất bản, entity `Exam` kiểm tra số phần, số câu và tổng điểm khớp nhau.

![Soạn đề](../images/41-admin-de-thi.webp)
