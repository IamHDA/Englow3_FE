// Import thẳng từ block, không qua barrel "@/features/chat": xem
// app/chat/loading.tsx.
import { ConversationPaneSkeleton } from "@/features/chat/components/blocks/ConversationPane/ConversationPaneSkeleton";

export default function ConversationLoading() {
  return <ConversationPaneSkeleton />;
}
