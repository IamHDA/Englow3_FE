# Chính tả (nghe chép)

Module backend: `dictation`. Màn: `/study/dictation`, `/study/dictation/[lessonId]`, `/study/dictation/[lessonId]/review`.

| Danh sách bài                            | Làm bài                                    |
| ---------------------------------------- | ------------------------------------------ |
| ![Danh sách](../images/15-chinh-ta.webp) | ![Làm bài](../images/16-chinh-ta-bai.webp) |

Một bài (lesson) gồm nhiều câu. Mỗi câu có đoạn audio (cắt từ một file chung bằng `audio_start_ms`, `audio_end_ms`),
câu gốc, bản dịch tiếng Việt và các mức gợi ý (số từ, chữ cái đầu, hiện một từ, hiện một phần câu).

## Luồng làm bài

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as DictationService
    participant S as DictationScorer (hàm thuần)
    participant D as PostgreSQL

    U->>W: mở bài
    W->>F: query DictationLesson
    F->>A: GET /api/dictation/lessons/{id}
    A-->>W: các câu kèm câu gốc, URL audio có chữ ký
    loop mỗi câu
        U->>W: nghe, gõ lại câu, có thể mở gợi ý
        W->>F: mutation SubmitDictation
        F->>A: POST /api/dictation/sentences/{id}/attempts { response }
        A->>S: so từng từ, bỏ dấu câu, không phân biệt hoa thường
        S-->>A: % chính xác, số từ đúng / tổng
        A->>D: INSERT dictation_attempts
        A-->>W: điểm, từ sai để tô màu, câu gốc
    end
```

- Một câu được tính là **đã qua khi đạt từ 80%**. Ngưỡng này nằm ở một chỗ (`DictationScorer.COMPLETION_THRESHOLD`) và
  được dùng chung cho tiến độ bài, màn thống kê và lộ trình hằng ngày, nên ba nơi không bao giờ nói khác nhau.
- Câu gốc được gửi kèm để màn hình tô đúng/sai ngay khi gõ xong, nhưng **điểm được lưu luôn do server tính** từ câu
  người học gửi lên.
- Mỗi lượt gõ là một dòng mới trong `dictation_attempts`; không ghi đè lượt cũ.

## Câu hay sai và thống kê

```mermaid
flowchart LR
    attempts[("dictation_attempts")] --> mistakes["GET /api/dictation/mistakes<br/>tối đa 10 câu hay sai nhất,<br/>gộp mọi bài, kèm audio"]
    attempts --> stats["GET /api/dictation/stats<br/>câu khó, từ hay nghe sai,<br/>lịch sử, chuỗi ngày"]
    mistakes --> review["Màn /review:<br/>luyện lại câu sai"]
```

"Câu hay sai" tính trên toàn bộ các bài, vì câu hỏi "mình hay sai gì" là về người học, không về một bài cụ thể. Danh
sách này **không** kèm câu gốc: người học phải chép lại và gửi lên server, nhờ vậy lượt luyện lại được ghi nhận.

## Nội dung

Staff soạn bài, upload audio (`/api/admin/dictation/media`) hoặc import file do data pipeline sinh
(`POST /api/admin/dictation/import`). Bài đi qua quy trình [soạn và duyệt](10-soan-duyet-noi-dung.md).
