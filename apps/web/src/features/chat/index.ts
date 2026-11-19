// What other features and the routes may import. The global header does not
// come through here: it uses "./header", which carries only its icon.
//
// `loading.tsx` is a Server Component: it imports its skeleton straight from the
// block, not through this barrel, which also pulls the views (client) into the
// server's module graph.
export { ChatPanePlaceholder } from "./components/blocks/ChatPanePlaceholder";
export { ChatRealtimeProvider } from "./components/views/ChatRealtimeProvider";
export { ChatView } from "./components/views/ChatView";
export { ConversationView } from "./components/views/ConversationView";
export { OpenChatButton } from "./components/views/OpenChatButton";
