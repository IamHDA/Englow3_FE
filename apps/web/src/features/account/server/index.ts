// Cửa riêng cho phía server. Tách khỏi barrel chính (`@/features/account`) vì
// barrel đó được Client Component import - gộp chung thì `server-only` sẽ chặn
// và build vỡ. Chỉ Server Component và Route Handler import từ đây.
export { getAccountProfile } from "./getAccountProfile";
