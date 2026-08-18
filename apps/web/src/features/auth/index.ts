// Chỉ những gì Client Component dùng được. `getServerSession` nằm ở
// "@/features/auth/server" - để chung đây thì mọi client import barrel này đều
// kéo theo next/headers và build sẽ vỡ (server-only chặn).
export { AuthModal } from "./components/blocks/AuthModal";
export { AuthProvider } from "./components/AuthProvider";
export { ResetPasswordView } from "./components/views/ResetPasswordView";
export { useAuth } from "./hooks/useAuth";
export type { AuthSession } from "./types";
