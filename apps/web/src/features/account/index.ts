// Chỉ những gì Client Component dùng được.
//
// KHÔNG export `getAccountProfile` ở đây: SiteHeaderNav ("use client") import
// barrel này, mà hàm đó có `import "server-only"` - để chung thì build vỡ. Gọi
// thẳng "@/features/account/server/getAccountProfile" từ phía server.
export { AccountProvider } from "./provider";
export { useAccountProfile } from "./hooks/useAccountProfile";
// The profile screen is in "@/features/account/views", for its route:
// exported here, it rode along on every page that imports this barrel.
export type { AccountProfile, AccountProfileResult } from "./types";
