# Englow3 Frontend (pnpm Monorepo)

Dự án Frontend cho hệ thống học tiếng Anh **Englow3**, được quản lý theo mô hình **pnpm monorepo** bao gồm ứng dụng Web, ứng dụng Mobile và lớp trung gian BFF (Backend-For-Frontend).

---

## 🌐 Live Environments & Deployment Links

| Environment | Branch | Web App (Next.js) | BFF GraphQL Server |
|---|---|---|---|
| **Production** | `main` | [https://englow3-web.vercel.app](https://englow3-web.vercel.app) | [https://englow3-bff.vercel.app/graphql](https://englow3-bff.vercel.app/graphql) |
| **Staging** | `dev` | [https://englow3-web-dev.vercel.app](https://englow3-web-dev.vercel.app) | [https://englow3-bff-dev.vercel.app/graphql](https://englow3-bff-dev.vercel.app/graphql) |

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

> ⚠️ Hiện chỉ `web` có script `lint`, và **chưa app nào có script `test`**. CI dùng
> `--if-present` nên các bước đó được bỏ qua chứ không fail — xem mục "Quality gate"
> trong Job Summary của mỗi lần chạy để biết bước nào thực sự đã chạy.

---

## 🚀 CI/CD

Hai workflow **độc lập**, không cái nào chờ cái nào:

| Workflow | File | Chạy khi | Nhiệm vụ |
|---|---|---|---|
| **CI** | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | `pull_request` vào `main`/`dev` | lint + typecheck + test |
| **Deploy** | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | `push`, `pull_request`, `workflow_dispatch` | build & deploy lên Vercel |

```text
ci.yml:      quality (matrix: web | bff | mobile, chạy song song)

deploy.yml:  setup ─┬─> deploy-web ─┐
                    └─> deploy-bff ─┴─> comment (chỉ trên PR)
```

Mỗi PR vì vậy chạy **2 workflow song song**: `CI` để validate, `Deploy` để dựng
preview. Deploy **không** phụ thuộc CI — một PR vẫn có preview xanh dù CI đang đỏ.
Cổng chặn nằm ở bước **merge** (branch protection), không nằm ở bước deploy.

`ci.yml` không có trigger `push` vì `main`/`dev` đã cấm push thẳng — mọi commit
vào hai branch đó đều đi qua PR và đã được CI kiểm tra rồi.

| Sự kiện | Target | URL |
|---|---|---|
| `push` vào `main` | `production` | domain production (do `--prod` tự gán) |
| `push` vào `dev` | `preview` | alias sang `englow3-{web,bff}-dev.vercel.app` |
| `pull_request` vào `main`/`dev` | `preview` | URL ngẫu nhiên, post vào PR comment |
| `workflow_dispatch` | do người chạy chọn | — |

Alias cho `dev` khai báo ở block `env` đầu file workflow (`DEV_ALIAS_WEB`,
`DEV_ALIAS_BFF`, `VERCEL_SCOPE`) — đổi domain staging thì sửa ở đúng một chỗ đó.

Web và BFF deploy ở **hai job riêng trên hai runner riêng**, để mỗi project có thư
mục `.vercel/` độc lập. Không gộp chung lại.

### Secrets bắt buộc

| Secret | Bắt buộc | Ghi chú |
|---|---|---|
| `VERCEL_TOKEN` | ✅ | |
| `VERCEL_ORG_ID` | ✅ | |
| `VERCEL_PROJECT_ID_WEB` | ✅ | fallback về `VERCEL_PROJECT_ID` |
| `VERCEL_PROJECT_ID_BFF` | — | thiếu thì job `deploy-bff` được bỏ qua, và PR comment sẽ nói rõ |

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
- ⚠️ **Chưa được đặt `CI / quality` làm required check.** Cả hai workflow đều bỏ qua
  thay đổi chỉ chạm `*.md`, `.idea/`, `.claude/`, `.gitignore` (`paths-ignore`), nên PR
  docs-only **không sinh ra check nào** và sẽ treo vĩnh viễn ở trạng thái "Expected —
  Waiting for status to be reported". Muốn bật required check thì trước đó phải bỏ
  `paths-ignore` khỏi `ci.yml`, hoặc thêm một job no-op làm check thay thế.
- `paths-ignore` xuất hiện ở **3 chỗ** (1 trong `ci.yml`, 2 trong `deploy.yml`) và phải
  sửa đồng bộ bằng tay — GitHub Actions không hỗ trợ YAML anchor.
- PR từ fork không được deploy (không có secrets) — đây là chủ ý.