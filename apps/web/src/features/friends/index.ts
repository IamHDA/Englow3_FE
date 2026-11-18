// Chỉ những gì route và Client Component khác dùng được.
//
// `loading.tsx` là Server Component: nó import skeleton thẳng từ block, không
// qua barrel này, vì barrel còn kéo theo các view (client) vào đồ thị của server.
export { FriendsView } from "./components/views/FriendsView";
export { WallView } from "./components/views/WallView";
export { IncomingRequestsBadge } from "./components/views/IncomingRequestsBadge";
