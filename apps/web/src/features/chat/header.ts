// What the global header imports, and nothing else.
//
// The header is on every page. Imported through "@/features/chat" it would pull
// the barrel's views into a chunk every page loads - the socket, the image
// upload, the message list - for the sake of one icon. This entry reaches only
// the icon and the little it needs (the unread query, its polling, a few
// constants), the way the account feature keeps what a client may import apart
// from what only the server may.
export { ChatUnreadIndicator } from "./components/views/ChatUnreadIndicator";
