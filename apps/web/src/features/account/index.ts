// Chỉ những gì Client Component dùng được.
//
// KHÔNG export `getAccountProfile` ở đây: SiteHeaderNav ("use client") import
// barrel này, mà hàm đó có `import "server-only"` - để chung thì build vỡ. Gọi
// thẳng "@/features/account/server/getAccountProfile" từ phía server.
export { AccountProvider } from "./provider";
export { useAccountProfile } from "./hooks/useAccountProfile";
export { ProfileView } from "./components/views/ProfileView";
export { ProfileSkeleton } from "./components/blocks/ProfileSkeleton";
export type { AccountProfile, AccountProfileResult } from "./types";
