// Chỉ những gì route và Client Component khác dùng được. Header toàn trang không
// đi qua đây: nó dùng "./header", chỉ mang theo cái huy hiệu.
//
// `loading.tsx` là Server Component: nó import skeleton thẳng từ block, không
// qua barrel này, vì barrel còn kéo theo các view (client) vào đồ thị của server.
export { FriendsView } from "./components/views/FriendsView";
export { WallView } from "./components/views/WallView";
