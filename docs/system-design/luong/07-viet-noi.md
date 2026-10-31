# Luyện Viết và Nói

Module backend: `assessment` (dùng `ai`). Màn: `/study/writing`, `/study/speaking`, `/study/assessments`. Khu chấm bài của
Staff/Admin: `/admin/assessments`.

Khác với [luyện phát âm](06-phat-am.md) (đọc lại một câu mẫu), đây là bài làm tự do: viết một đoạn văn hoặc nói về một
chủ đề, được chấm theo **4 tiêu chí** như bài thi thật.

| Làm bài Viết                        | Báo cáo kết quả                                |
| ----------------------------------- | ---------------------------------------------- |
| ![Viết](../images/23-viet-bai.webp) | ![Báo cáo](../images/26-danh-gia-ket-qua.webp) |

## Luồng làm bài

```mermaid
sequenceDiagram
    autonumber
    actor U as Người học
    participant W as Web
    participant F as BFF
    participant A as AssessmentService
    participant S3 as Object storage
    participant Q as ai_jobs
    participant H as ProductiveAssessmentHandler
    participant AI as ai_service

    U->>W: chọn đề
    W->>F: mutation StartAssessment
    F->>A: POST /api/assessments/tasks/{id}/attempts (clientKey)
    A->>A: tạo attempt DRAFT, chụp lại đề và tiêu chí (task_snapshot)
    A-->>W: attempt (+ URL upload nếu là bài Nói)
    loop khi đang viết
        W->>W: lưu bản nháp vào localStorage
        W->>F: mutation SaveDraft
        F->>A: PUT /api/assessments/attempts/{id}/draft (kèm version)
        A->>A: version lệch thì 409 DRAFT_CHANGED
    end
    opt bài Nói
        W->>S3: PUT bản ghi bằng presigned URL (tối đa 10 MB)
    end
    U->>W: nộp bài
    W->>F: mutation SubmitAssessment
    F->>A: POST /api/assessments/attempts/{id}/submit
    opt bài Nói
        A->>S3: chép bản ghi sang khoá cố định (seal),<br/>URL upload cũ không thể thay bài đã nộp
    end
    alt chấm tự động đang bật
        A->>A: kiểm tra hạn mức AI, attempt -> QUEUED
        A->>Q: INSERT job PRODUCTIVE_ASSESSMENT
        Q-->>H: worker chạy job
        opt bài Nói
            H->>AI: /speech/assess - chép lời, điểm phát âm, lưu loát
        end
        H->>AI: /llm/generate - điểm và bằng chứng cho 4 tiêu chí
        H->>H: kiểm tra đủ 4 tiêu chí,<br/>backend tự tính điểm trung bình
        H->>A: ghi report -> COMPLETED
    else chấm tự động tắt
        A->>A: attempt -> NEEDS_REVIEW, vào hàng chờ chấm tay
    end
    loop polling
        W->>F: query AssessmentAttempt
        F->>A: GET /api/assessments/attempts/{id}
    end
```

```mermaid
stateDiagram-v2
    [*] --> DRAFT : bắt đầu
    DRAFT --> QUEUED : nộp, chấm tự động bật
    DRAFT --> NEEDS_REVIEW : nộp, chấm tự động tắt
    QUEUED --> COMPLETED : AI chấm xong
    QUEUED --> FAILED : job bỏ cuộc
    FAILED --> QUEUED : người học bấm thử lại
    FAILED --> NEEDS_REVIEW : người học yêu cầu chấm tay
    NEEDS_REVIEW --> COMPLETED : Staff chấm
    COMPLETED --> COMPLETED : Admin sửa điểm (có lưu vết)
    COMPLETED --> [*]
```

## Những điểm thiết kế quan trọng

- **Chụp đề khi bắt đầu.** Attempt lưu bản sao đề và tiêu chí (`task_snapshot`); đề đã xuất bản không sửa được. Bài mẫu
  chỉ hiện sau khi có kết quả.
- **Bản nháp hai lớp.** Lưu trên server có kiểm tra version (hai tab cùng sửa thì tab cũ bị từ chối), cộng bản sao trong
  `localStorage` để mất mạng không mất bài. Bài đã nộp không sửa được.
- **Chặn kết quả cũ.** Mỗi lần gửi chấm tăng `grading_revision`. Kết quả về với revision cũ (ví dụ từ lần chấm trước khi
  người học bấm thử lại) bị bỏ qua.
- **Điểm do backend tính.** LLM trả điểm từng tiêu chí kèm bằng chứng; backend kiểm tra đủ và tự tính trung bình, gắn
  nhãn "điểm luyện tập ước lượng".
- **Chấm tay có lưu vết.** Staff chấm, Admin sửa điểm đều ghi một dòng `assessment_reviews` kèm báo cáo trước đó và ghi
  chú của người chấm.
- **Thông báo.** Khi có kết quả, người học thấy thông báo (`/api/assessments/notifications`), đánh dấu đã đọc riêng
  từng bài.

## Phân quyền

| Vai trò | Được làm                                                       |
| ------- | -------------------------------------------------------------- |
| Learner | Xem đề đã xuất bản, làm bài, xem bài và báo cáo của chính mình |
| Staff   | Soạn đề, gửi duyệt, chấm bài thuộc đề mình soạn                |
| Admin   | Duyệt, từ chối, lưu trữ đề; sửa điểm bài đã chấm               |

![Khu chấm bài](../images/43-admin-danh-gia.webp)
