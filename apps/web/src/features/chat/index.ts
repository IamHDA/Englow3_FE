// What the routes may import. Nobody else comes through here: the global header
// uses "./header" (its icon) and the friends screens "./openChat" (the Message
// button), so none of them carries the socket.
//
// `loading.tsx` is a Server Component: it imports its skeleton straight from the
// block, not through this barrel, which also pulls the views (client) into the
// server's module graph.
export { ChatPanePlaceholder } from "./components/blocks/ChatPanePlaceholder";
export { ChatRealtimeProvider } from "./components/views/ChatRealtimeProvider";
export { ChatView } from "./components/views/ChatView";
export { ConversationView } from "./components/views/ConversationView";
