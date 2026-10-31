# Flashcard

Module backend: `flashcard`. Màn: `/study/flashcards`, `/study/flashcards/[setId]`, `/study/flashcards/[setId]/study`.

| Thư viện bộ thẻ                          | Ôn tập                                        |
| ---------------------------------------- | --------------------------------------------- |
| ![Thư viện](../images/12-flashcard.webp) | ![Ôn tập](../images/14-flashcard-on-tap.webp) |

## Luồng ôn tập

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as FlashcardService
    participant S as FlashcardSrs (hàm thuần)
    participant D as PostgreSQL

    U->>W: mở thư viện
    W->>F: query FlashcardSets
    F->>A: GET /api/flashcards/sets
    A-->>W: bộ thẻ đã xuất bản, số thẻ đến hạn, % đã thuộc
    U->>W: "Bắt đầu ôn ngay"
    W->>F: query StudyQueue
    F->>A: GET /api/flashcards/sets/{id}/study-queue
    A->>D: thẻ đến hạn (due_at <= now) và thẻ mới
    A-->>W: hàng đợi thẻ
    loop mỗi thẻ
        U->>W: lật thẻ, chọn Again / Hard / Good / Easy
        W->>F: mutation ReviewFlashcard
        F->>A: POST /api/flashcards/{id}/reviews { rating }
        A->>D: đọc flashcard_reviews (tạo mới nếu chưa có)
        A->>S: schedule(trạng thái hiện tại, rating, now)
        S-->>A: repetitions, ease, interval, due_at, status
        A->>D: cập nhật flashcard_reviews,<br/>thêm flashcard_review_logs
        A-->>W: lịch mới của thẻ
    end
```

## Thuật toán lặp lại ngắt quãng (SM-2)

`FlashcardSrs` là hàm thuần của (trạng thái hiện tại, nút bấm, thời điểm), nên được test đủ mọi trường hợp mà không cần
cơ sở dữ liệu.

| Nút   | Điểm SM-2 | Ảnh hưởng tới ease | Thẻ quay lại                                         |
| ----- | --------- | ------------------ | ---------------------------------------------------- |
| Again | 2         | Giảm 0,32          | Sau 10 phút, trong cùng buổi học; đặt lại số lần nhớ |
| Hard  | 3         | Giảm 0,14          | Theo khoảng tiếp theo                                |
| Good  | 4         | Giữ nguyên         | Theo khoảng tiếp theo                                |
| Easy  | 5         | Tăng 0,10          | Theo khoảng tiếp theo                                |

Khoảng cách ôn: lần nhớ thứ nhất 1 ngày, lần thứ hai 6 ngày, từ lần thứ ba nhân với hệ số ease (làm tròn lên, tối đa
100 năm). Ease bắt đầu 2,5 và không xuống dưới 1,3.

```mermaid
stateDiagram-v2
    [*] --> NEW : chưa từng ôn
    NEW --> LEARNING : nhớ 1 lần, hoặc bấm Again
    LEARNING --> REVIEW : nhớ 2 lần liên tiếp
    REVIEW --> MASTERED : nhớ 4 lần liên tiếp
    REVIEW --> LEARNING : bấm Again
    MASTERED --> LEARNING : bấm Again
```

## Thống kê

`GET /api/flashcards/stats` trả số thẻ theo trạng thái, lịch sử ôn theo ngày và chuỗi ngày ôn, tính từ
`flashcard_review_logs`. Tab "Thống kê học tập" trên màn thư viện hiển thị dữ liệu này.

## Nội dung

Staff soạn bộ thẻ hoặc import file do data pipeline sinh (`POST /api/admin/flashcards/import`, có chạy thử trước). Bộ
thẻ đi qua quy trình [soạn và duyệt](10-soan-duyet-noi-dung.md) trước khi learner thấy. Audio của thẻ nằm trong bucket
`learning`.
