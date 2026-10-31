# Đăng nhập và onboarding

Module backend: `user`. Feature web: `auth`, `account`, `onboarding`.

## Đăng ký và đăng nhập

Supabase giữ tài khoản và mật khẩu. Englow3 chỉ giữ hồ sơ, liên kết với Supabase qua `users.auth_provider_id`.

![Màn đăng nhập](../images/03-dang-nhap.webp)

```mermaid
sequenceDiagram
    autonumber
    actor U as Người dùng
    participant W as Web
    participant S as Supabase Auth
    participant DB as PostgreSQL

    alt Đăng ký bằng email
        U->>W: email, mật khẩu
        W->>S: signUp
        S->>DB: INSERT auth.users
        DB->>DB: trigger V024 tạo dòng englow3.users<br/>role = LEARNER, onboarding_step = LEARNING_PURPOSES
        S-->>U: email xác minh
    else Google / Facebook
        U->>W: bấm nút
        W->>S: OAuth, quay về /auth/callback
        S->>DB: INSERT auth.users (lần đầu) và trigger như trên
    end
    U->>W: đăng nhập
    W->>S: signInWithPassword
    S-->>W: access token + refresh token
    W-->>U: cookie HttpOnly, chuyển về trang đang xem
```

- Quên mật khẩu: `/auth/forgot` gửi link qua Supabase tới callback đã được cho phép, người dùng đặt mật khẩu mới ở
  `/auth/reset`.
- Đăng xuất: `/api/auth/logout` xoá cookie; `ApolloWrapper` dựng lại cache theo `userId`.
- Role nằm trong JWT (`app_metadata.role`). Admin đổi role trong bảng `users`, trigger `V026` chép sang Supabase; người
  dùng cần đăng nhập lại (hoặc chờ token làm mới) để có role mới.

## Onboarding năm bước

Learner mới đăng nhập sẽ thấy popup onboarding trên mọi trang cho tới khi xong. Đóng popup thì header hiện nút
"Hoàn thiện thông tin" để mở lại. Staff và Admin không có onboarding.

| Bước 1: mục đích học                                      | Bước 3: trình độ hiện tại                             |
| --------------------------------------------------------- | ----------------------------------------------------- |
| ![Bước 1](../images/33-onboarding-learning-purposes.webp) | ![Bước 3](../images/35-onboarding-current-level.webp) |

```mermaid
stateDiagram-v2
    [*] --> LEARNING_PURPOSES : tài khoản mới
    LEARNING_PURPOSES --> CERTIFICATE_TARGET : PUT /api/onboarding/learning-purposes
    CERTIFICATE_TARGET --> CURRENT_LEVEL : PUT /certificate-target<br/>IELTS / TOEIC, điểm mục tiêu
    CURRENT_LEVEL --> LEARNING_GOAL : PUT /current-level<br/>tự chọn A1..C2 hoặc làm bài xếp lớp
    LEARNING_GOAL --> TARGET_SKILLS : PUT /learning-goal<br/>ngày mục tiêu
    TARGET_SKILLS --> COMPLETED : PUT /target-skills rồi POST /complete
    COMPLETED --> [*]
```

```mermaid
sequenceDiagram
    autonumber
    participant W as Web
    participant F as BFF
    participant A as Backend (user)

    W->>F: query CurrentUser
    F->>A: GET /api/user/me/bootstrap
    A-->>F: tài khoản + onboarding_step trong một transaction
    F-->>W: me { role, onboardingStep, ... }
    W->>W: OnboardingProvider: learner, chưa COMPLETED<br/>và bước có giao diện thì mở popup
    loop mỗi bước
        W->>F: mutation lưu bước
        F->>A: PUT /api/onboarding/<bước>
        A->>A: entity kiểm tra đúng thứ tự bước
        A-->>F: trạng thái mới
        F-->>W: bước tiếp theo
    end
```

## Bài kiểm tra xếp lớp

Ở bước trình độ, learner có thể làm bài xếp lớp thay vì tự chọn. Bài xếp lớp là một đề thi loại `PLACEMENT` (lấy qua
`GET /api/exams/placement`), làm theo đúng luồng [thi thử](08-thi-thu.md). Khi lượt thi đầy đủ (không phải luyện tập
từng phần) được chấm, module `exam` gọi `user.api.PlacementRecorder` để ghi trình độ và `placement_attempt_id` vào
`learner_profiles`.

## Tour hướng dẫn

Lần đầu vào các màn chính, `UserTourProvider` chạy tour đánh dấu vùng trên màn theo vai trò (learner, staff, admin).
Tour đã xem được lưu qua `PUT /api/user/me/tour` (bảng `user_tour_completions`) để không hiện lại.
