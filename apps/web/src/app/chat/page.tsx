import { ChatPanePlaceholder } from "@/features/chat";

// The list is in the layout; /chat itself has no conversation open, so beside
// the list (on a wide screen) there is only an invitation to pick one.
export default function ChatPage() {
  return <ChatPanePlaceholder />;
}
