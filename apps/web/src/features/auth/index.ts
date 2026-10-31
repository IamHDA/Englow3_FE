// Chỉ những gì Client Component dùng được.
//
// KHÔNG export `getServerSession` ở đây: mọi Client Component import barrel này
// sẽ kéo theo next/headers và build vỡ (server-only chặn). Gọi thẳng
// "@/features/auth/server/getServerSession" từ phía server.
export { AuthModal } from "./components/blocks/AuthModal";
export { AuthProvider } from "./provider";
export { ForgotPasswordView } from "./components/views/ForgotPasswordView";
export { ResetPasswordView } from "./components/views/ResetPasswordView";
export { useAuth } from "./hooks/useAuth";
export { ADMIN_ROLE, STAFF_ROLE, homeForRole, isBackOfficeRole } from "./types";
export type { AuthSession } from "./types";
