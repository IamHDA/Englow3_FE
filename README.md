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

---

## 🔄 Quy trình CI/CD (GitHub Actions)

Mọi Pull Request và commit push vào nhánh `dev` hoặc `main` đều tự động kích hoạt workflow CI/CD:
1. **Quality Gates**: Tự động chạy `Lint`, `Typecheck` TypeScript và `Test` riêng biệt từng ứng dụng (`web`, `bff`, `mobile`).
2. **Preview Deployments**: Tự động tạo trang Preview và post comment URL trên Pull Request.
3. **Domain Aliasing**: Tự động gán tên miền cố định tương ứng khi merge vào nhánh `dev` hoặc `main`.