# Gói dịch vụ

Module backend: `subscription`. Màn: `/pricing` (bảng giá), tab trong `/profile`, `/admin/subscriptions` (cấp gói).

| Bảng giá                                | Cấp gói (Admin)                                 |
| --------------------------------------- | ----------------------------------------------- |
| ![Bảng giá](../images/05-bang-gia.webp) | ![Cấp gói](../images/45-admin-goi-dang-ky.webp) |

## Hai gói

| Gói    | Giá (mặc định)                | Lượt gọi AI mỗi ngày |
| ------ | ----------------------------- | -------------------- |
| `FREE` | 0                             | 100                  |
| `PRO`  | 99.000 đ/tháng, 990.000 đ/năm | 300                  |

Giá và hạn mức đặt bằng biến môi trường (`PLAN_PRO_PRICE_MONTHLY`, `PLAN_PRO_PRICE_YEARLY`, `PLAN_PRO_AI_DAILY_LIMIT`,
`AI_DAILY_REQUEST_LIMIT`). **Chưa kết nối cổng thanh toán**: giá chỉ để hiển thị, gói PRO do Admin cấp tay.

## Luồng

```mermaid
sequenceDiagram
    autonumber
    actor L as Learner
    actor AD as Admin
    participant A as SubscriptionService
    participant D as user_subscriptions
    participant Q as AiJobQueue

    L->>A: GET /api/plans (công khai, không cần đăng nhập)
    A-->>L: danh sách gói, giá, hạn mức
    AD->>A: PUT /api/admin/subscriptions { userId, plan PRO, kỳ hạn }
    A->>D: ghi plan, current_period_end, source = MANUAL, người cấp
    L->>A: GET /api/user/me/subscription
    A->>D: đọc
    A-->>L: PRO tới ngày X (hết hạn thì đọc ra FREE)
    Note over Q: Khi learner chấm phát âm, chấm bài hay hỏi gia sư
    Q->>A: PlanEntitlements: hạn mức hôm nay của người này?
    A-->>Q: 100 hoặc 300
    Q->>Q: đếm job hôm nay theo requested_by_user_id,<br/>vượt thì từ chối (409, mã như TUTOR_DAILY_LIMIT_REACHED)
```

- **Hết hạn không cần ai ghi gì.** Gói được tính từ `current_period_end`; qua mốc đó là đọc ra `FREE`, nên gói đã hết hạn
  không bao giờ còn cấp quyền.
- Gói PRO bắt buộc có ngày hết hạn (ràng buộc trong cơ sở dữ liệu). Cấp tối đa 3650 ngày một lần.
- `DELETE /api/admin/subscriptions` thu hồi gói.
- Module khác chỉ hỏi hai câu nhỏ qua `subscription.api.PlanEntitlements` ("người này còn được gọi AI không"), không biết
  có những gói nào. Thêm gói hay đổi hạn mức chỉ sửa module này.
