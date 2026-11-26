# Englow3 Frontend (pnpm Monorepo)

Dự án Frontend cho hệ thống học tiếng Anh **Englow3**, được quản lý theo mô hình **pnpm monorepo** bao gồm ứng dụng Web, ứng dụng Mobile và lớp trung gian BFF (Backend-For-Frontend).

---

## 🌐 Live Environments & Deployment Links

| Environment    | Branch    | Web App (Next.js)                                                          | BFF GraphQL Server                                                                         |
| -------------- | --------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Production** | `main`    | [https://englow3-web.vercel.app](https://englow3-web.vercel.app)           | [https://englow3-bff.vercel.app/graphql](https://englow3-bff.vercel.app/graphql)           |
| **Staging**    | `dev`     | [https://englow3-web-dev.vercel.app](https://englow3-web-dev.vercel.app)   | [https://englow3-bff-dev.vercel.app/graphql](https://englow3-bff-dev.vercel.app/graphql)   |
| **Testing**    | `testing` | [https://englow3-web-test.vercel.app](https://englow3-web-test.vercel.app) | [https://englow3-bff-test.vercel.app/graphql](https://englow3-bff-test.vercel.app/graphql) |

---

## 🏗️ Cấu trúc Monorepo

```text
Englow3_FE/
├── apps/
│   ├── web/        # Next.js 16 (React 19, Tailwind CSS v4)
│   ├── bff/        # Express + Apollo Server 4 (GraphQL BFF)
│   └── mobile/     # Expo ~57 (React Native 0.86)
├── packages/       # Thư viện & components chia sẻ dùng chung
└── .github/        # Workflow GitHub Actions CI/CD
```

---

## 🛠️ Lệnh khởi chạy & Kiểm thử (Local Commands)

### 1. Khởi chạy ứng dụng

- **Web App**: `pnpm dev:web`
- **BFF Server**: `pnpm dev:bff`
- **Mobile App**: `pnpm dev:mobile`

### 2. Validate Code & Typecheck

- **Toàn bộ Monorepo**:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
- **Từng ứng dụng riêng lẻ**:
  - Web: `pnpm lint:web` | `pnpm typecheck:web`
  - BFF: `pnpm lint:bff` | `pnpm typecheck:bff`
  - Mobile: `pnpm lint:mobile` | `pnpm typecheck:mobile`

> Cả ba app (`web`, `bff`, `mobile`) đều có script `lint` và `test`. CI dùng
> `--if-present`, nên một app thiếu script sẽ bị bỏ qua chứ không fail — xem mục
> "Quality gate" trong Job Summary của mỗi lần chạy để biết bước nào thực sự đã chạy.

### 3. GraphQL types của BFF

Type của resolver được sinh từ SDL (`apps/bff/src/graphql/schema.ts`, `apps/bff/src/modules/**/*.typeDefs.ts`)
vào `apps/bff/src/generated/graphql.ts`. Sau khi sửa SDL, chạy lại rồi **commit file sinh ra** — không sửa tay:

```bash
pnpm --filter bff codegen
```

### 4. Ứng dụng Mobile (Expo)

Expo SDK 58 (React Native 0.88), chạy trên Android và iOS. Học viên có đủ mọi tính năng
của web: đăng nhập (email, Google, Facebook), onboarding, lộ trình hằng ngày, thẻ từ, trắc
nghiệm, nghe chép, phát âm, dịch, bài Nói/Viết có chấm AI, đề thi và IELTS Full Test, gia
sư AI, blog, chat, bạn bè, hồ sơ. Khu quản trị cũng đủ như web: soạn và duyệt nội dung học,
đề thi (kèm audio/ảnh), đề Nói/Viết, IELTS Full Test, tạo đề bằng AI, gia sư AI (báo cáo,
kho kiến thức, điều khiển), chấm bài và phân công chấm, blog, người dùng, gói Pro, trọng số
kiểm tra trình độ, bảng quy đổi điểm TOEIC.

```bash
cp apps/mobile/.env.local.example apps/mobile/.env.local   # điền Supabase, BFF, web URL
pnpm dev:mobile                                            # Expo Go hoặc development build
pnpm --filter mobile test                                  # Jest (jest-expo)
pnpm --filter mobile codegen                               # sinh lại hooks GraphQL
```

- Gọi thẳng BFF bằng `Authorization: Bearer` (phiên Supabase lưu mã hoá: khoá trong
  SecureStore, dữ liệu trong AsyncStorage). Không cần sửa BFF.
- GraphQL dùng **chung file `.graphql` của web** (`apps/web/src/features/**`), cộng
  file riêng trong `apps/mobile/src`. Sửa operation của web → chạy lại codegen mobile
  và commit; CI kiểm tra file sinh ra không bị lệch.
- Ghi âm tạo WAV 16 kHz mono ngay trên máy (từ luồng PCM của `expo-audio`), vì mọi
  đường chấm giọng nói ở backend chỉ nhận `audio/wav` và Android không ghi được WAV.
- Supabase phải cho phép URL chuyển hướng `englow3://auth/callback` và
  `englow3://auth/reset` (Authentication → URL Configuration) để xác nhận email,
  đặt lại mật khẩu và OAuth hoạt động trên điện thoại.
- Nháp soạn nội dung được giữ trên máy (AsyncStorage, 24 giờ) cho tới khi lưu lên máy chủ,
  giống web giữ trong localStorage. Audio cho đề thi/nghe chép/thẻ từ chọn bằng
  `expo-document-picker` (MP3/WAV ≤ 12 MB).
- Kiểu route (`typedRoutes`) do Expo sinh vào `.expo/types` khi chạy `expo start`; chạy
  một lần sau khi thêm màn mới để `tsc` kiểm tra đường dẫn.
- Đóng gói bản cài: `eas build --profile preview` (APK nội bộ) hoặc `--profile production`
  (cần tài khoản Expo; cấu hình trong `apps/mobile/eas.json`).

---

## 🚀 CI/CD

Hai workflow **độc lập**, không cái nào chờ cái nào:

| Workflow   | File                                                           | Chạy khi                                      | Nhiệm vụ                  |
| ---------- | -------------------------------------------------------------- | --------------------------------------------- | ------------------------- |
| **CI**     | [`.github/workflows/ci.yml`](.github/workflows/ci.yml)         | `pull_request` **và** `push` vào `main`/`dev` | lint + typecheck + test   |
| **Deploy** | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | `push`, `workflow_dispatch`                   | build & deploy lên Vercel |

```text
ci.yml:      quality (matrix: web | bff | mobile, chạy song song)

deploy.yml:  setup ─┬─> deploy-web
                    └─> deploy-bff
```

`Deploy` **không có trigger `pull_request`**: PR vào `main`/`dev` chỉ chạy `CI`, không
deploy — tránh việc mỗi PR sinh ra một domain ngẫu nhiên mà web/BFF không thể biết
domain của nhau để kết nối. Deploy chỉ chạy khi `push` (tức là sau khi merge/push thẳng)
hoặc qua `workflow_dispatch` thủ công.

CI chạy **cả sau khi merge**, không chỉ trên PR. Lý do: một lượt CI trên PR chỉ
chứng minh bản merge thử tại thời điểm đó là xanh. Hai PR độc lập cùng xanh vẫn
có thể làm hỏng `dev` khi cả hai cùng vào — và nếu CI không chạy trên `push` thì
không ai phát hiện. Bật "Require branches to be up to date before merging" thu hẹp
khe hở này, nhưng đó là setting của repo, không phải thứ được đảm bảo trong code.

Có **3 môi trường độc lập**, mỗi cái một branch, một domain cố định:

| Sự kiện              | Target             | URL                                            |
| -------------------- | ------------------ | ---------------------------------------------- |
| `push` vào `main`    | `production`       | domain production (do `--prod` tự gán)         |
| `push` vào `dev`     | `preview`          | alias sang `englow3-{web,bff}-dev.vercel.app`  |
| `push` vào `testing` | `preview`          | alias sang `englow3-{web,bff}-test.vercel.app` |
| `workflow_dispatch`  | do người chạy chọn | —                                              |

`testing` **không có branch protection, không đi qua PR** — push hoặc merge thẳng vào
đó để lấy domain cố định test nhanh, tách biệt với `dev`. Vì không qua PR, code lên
`testing` không được `ci.yml` gate trước khi deploy (branch protection là cổng chặn duy
nhất, và `testing` không bật nó) — đánh đổi có chủ ý để `testing` nhanh, không phải sơ suất.

Alias khai báo ở block `env` đầu file workflow (`DEV_ALIAS_WEB`, `DEV_ALIAS_BFF`,
`TEST_ALIAS_WEB`, `TEST_ALIAS_BFF`, `VERCEL_SCOPE`) — đổi domain staging/testing thì sửa
ở đúng một chỗ đó. Domain `englow3-{web,bff}-test.vercel.app` **không cần tạo trước**
trong Vercel dashboard: đây là subdomain `*.vercel.app` (không phải domain ngoài), nên
`vercel alias set` tự claim ngay ở lần chạy đầu tiên — giống hệt cách
`englow3-{web,bff}-dev.vercel.app` đã có, không ai add tay trong dashboard cả.

### Env vars cho `dev` vs `testing`

Vercel chỉ có 3 environment: Production, Preview, Development — và **Development
không deploy được**, nó chỉ dùng cho `vercel dev` / `vercel env pull` ở máy local.
Nên `dev` và `testing` đều là `preview`, và mặc định chúng **dùng chung một bộ env
vars**.

Để tách ra, khai báo biến trong Vercel dashboard với Environment = **Preview** và
chọn **branch cụ thể**:

| Key                           | Branch    | Value                                         |
| ----------------------------- | --------- | --------------------------------------------- |
| `NEXT_PUBLIC_BFF_GRAPHQL_URL` | `dev`     | `https://englow3-bff-dev.vercel.app/graphql`  |
| `NEXT_PUBLIC_BFF_GRAPHQL_URL` | `testing` | `https://englow3-bff-test.vercel.app/graphql` |

Biến Preview **không** gắn branch vẫn là fallback, nên chỉ cần override đúng những
key khác nhau giữa hai môi trường. `vercel pull` chỉ trả về bộ đã scope khi được
truyền `--git-branch` — flag đó nằm trong `.github/actions/vercel-deploy/action.yml`,
đừng bỏ đi.

Web và BFF deploy ở **hai job riêng trên hai runner riêng**, để mỗi project có thư
mục `.vercel/` độc lập. Không gộp chung lại.

### Secrets bắt buộc

| Secret                  | Bắt buộc | Ghi chú                                                                  |
| ----------------------- | -------- | ------------------------------------------------------------------------ |
| `VERCEL_TOKEN`          | ✅       |                                                                          |
| `VERCEL_ORG_ID`         | ✅       |                                                                          |
| `VERCEL_PROJECT_ID_WEB` | ✅       | fallback về `VERCEL_PROJECT_ID`                                          |
| `VERCEL_PROJECT_ID_BFF` | —        | thiếu thì job `deploy-bff` được bỏ qua (xem `has_bff` trong Job Summary) |

### Cấu hình phía Vercel

CLI chạy từ **gốc repo**, nên mỗi Vercel project phải tự khai báo thư mục nguồn
trong dashboard — workflow không truyền đường dẫn:

- Project Web → **Root Directory** = `apps/web`
- Project BFF → **Root Directory** = `apps/bff`

Sai setting này thì CI fail mà log không nói rõ nguyên nhân.

Cả hai `vercel.json` đều đặt `git.deploymentEnabled: false` để Vercel không tự deploy
song song với GitHub Actions. Đừng bật lại.

### Ghi chú vận hành

- Muốn chặn deploy production bằng approval: vào **Settings → Environments →
  `production`** thêm required reviewers. Job `deploy-web`/`deploy-bff` sẽ chờ duyệt.
- Vercel CLI được **pin cứng version** trong
  [`.github/actions/vercel-deploy/action.yml`](.github/actions/vercel-deploy/action.yml).
  Nâng version là một thay đổi có chủ đích, không dùng `@latest`.
- ⚠️ **Cần bật `CI / quality (web|bff|mobile)` làm required check** cho `dev` và `main`
  trong Settings → Branches. Chưa bật thì deploy không chờ CI, mà merge cũng không
  chờ CI — tức là **không có cổng chặn tự động nào**. Đây là việc duy nhất còn lại
  phải làm trên giao diện GitHub.
- `ci.yml` **cố ý không có `paths-ignore`**: workflow bị skip thì không báo check nào,
  nên PR docs-only sẽ treo vĩnh viễn ở "Expected — Waiting for status to be reported"
  một khi `quality` là required check. Đừng thêm `paths-ignore` vào `ci.yml`.
- `paths-ignore` chỉ còn ở **1 chỗ** (`deploy.yml`, block `push`) — không cần đồng bộ
  với chỗ nào khác nữa.
- Không PR nào (kể cả từ fork) trigger deploy — `deploy.yml` không còn nghe
  `pull_request`, PR chỉ chạy `CI`.
