# Soạn và duyệt nội dung

Áp dụng cho mọi loại nội dung: đề thi (`exam`), bộ flashcard (`flashcard`), trắc nghiệm (`quiz`), bài chính tả
(`dictation`), câu luyện phát âm (`speaking`), đề Viết/Nói (`assessment`). Mỗi module có enum trạng thái riêng nhưng
cùng một quy trình. Màn: `/admin/content`, `/admin/exams`, `/admin/assessments`.

![Quản lý nội dung](../images/42-admin-noi-dung.webp)

## Quy trình bốn mắt

Người soạn (Staff) không tự xuất bản được nội dung của mình; Admin duyệt. Learner chỉ thấy nội dung `PUBLISHED`.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Staff tạo, hoặc import từ data pipeline
    DRAFT --> PENDING_REVIEW : Staff gửi duyệt
    REJECTED --> PENDING_REVIEW : Staff sửa rồi gửi lại
    PENDING_REVIEW --> PUBLISHED : Admin duyệt
    PENDING_REVIEW --> REJECTED : Admin từ chối (bắt buộc ghi lý do)
    DRAFT --> PUBLISHED : Admin xuất bản thẳng
    PUBLISHED --> ARCHIVED : Admin lưu trữ
    DRAFT --> ARCHIVED : Admin lưu trữ (từ mọi trạng thái)
    ARCHIVED --> PUBLISHED : khôi phục, nếu đã từng xuất bản
    ARCHIVED --> DRAFT : khôi phục, nếu chưa từng xuất bản
```

```mermaid
sequenceDiagram
    autonumber
    actor S as Staff
    actor AD as Admin
    participant W as Web /admin
    participant A as Backend (module nội dung)

    S->>W: soạn nội dung, upload media
    W->>A: POST/PUT /api/admin/<loại>/... (authoring, có version)
    S->>W: "Gửi duyệt"
    W->>A: POST .../{id}/submit-for-review
    A->>A: entity kiểm tra đủ điều kiện<br/>(ví dụ đề thi: số phần, số câu, tổng điểm khớp)
    AD->>W: mở hàng chờ duyệt
    alt đạt
        W->>A: POST .../{id}/approve (chỉ ADMIN)
        A->>A: PUBLISHED, ghi người duyệt và thời điểm
    else chưa đạt
        W->>A: POST .../{id}/reject { note } (chỉ ADMIN)
        A->>A: REJECTED, Staff thấy lý do
    end
```

## Phân quyền

- Mọi route `/api/admin/**` yêu cầu `STAFF` hoặc `ADMIN`.
- `approve`, `reject`, `publish`, `restore`, `archive` có thêm `@PreAuthorize("hasRole('ADMIN')")`.
- Staff chỉ thấy và chấm đề Viết/Nói do chính mình soạn.

## Soạn có version

Màn soạn (`/admin/content/editor/[kind]/[id]`) lưu toàn bộ cấu trúc qua endpoint `.../authoring` kèm số version. Hai
người cùng sửa thì người lưu sau bị từ chối thay vì âm thầm ghi đè.

## Import nội dung sinh tự động

```mermaid
flowchart LR
    pipe["data_pipeline<br/>sinh, kiểm tra schema, QA"] --> file["File batch JSON"]
    file --> dry["POST /api/admin/<flashcards|dictation>/import<br/>chạy thử: báo lỗi từng dòng"]
    dry --> real["Import thật"]
    real --> draft["Nội dung ở trạng thái DRAFT"]
    draft --> review["Quy trình duyệt như trên"]
```

Nội dung sinh tự động **luôn vào trạng thái nháp**: nội dung sinh ra chưa phải nội dung đã duyệt, và import thẳng vào
trạng thái xuất bản sẽ là đường vòng qua quy trình duyệt. Import câu hỏi đề thi từ CSV/XLSX/DOCX chưa có.
