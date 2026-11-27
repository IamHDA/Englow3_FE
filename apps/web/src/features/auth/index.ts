// Chỉ những gì Client Component dùng được.
//
// KHÔNG export `getServerSession` ở đây: mọi Client Component import barrel này
// sẽ kéo theo next/headers và build vỡ (server-only chặn). Gọi thẳng
// "@/features/auth/server/getServerSession" từ phía server.
// Lazy: the forms load on the first open, not with every page (LazyAuthModal).
export { LazyAuthModal as AuthModal } from "./components/blocks/LazyAuthModal";
export { AuthProvider } from "./provider";
// The forgot/reset screens are in "@/features/auth/views", for their routes:
// exported here, they rode along on every page that imports this barrel.
export { useAuth } from "./hooks/useAuth";
export { ADMIN_ROLE, STAFF_ROLE, homeForRole, isBackOfficeRole } from "./types";
export type { AuthSession } from "./types";
