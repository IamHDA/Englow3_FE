// Import thẳng từ block, không qua barrel "@/features/chat": barrel còn
// re-export các view (client) cùng hook, nên một Server Component chạm vào nó
// sẽ kéo cả nhánh client vào đồ thị module của server.
import { ConversationPaneSkeleton } from "@/features/chat/components/blocks/ConversationPane/ConversationPaneSkeleton";

export default function ChatLoading() {
  return <ConversationPaneSkeleton />;
}
