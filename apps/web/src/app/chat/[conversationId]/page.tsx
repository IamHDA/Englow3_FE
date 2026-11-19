import { ConversationView } from "@/features/chat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  // Keyed, so another conversation starts afresh rather than inheriting this one's messages.
  return (
    <ConversationView key={conversationId} conversationId={conversationId} />
  );
}
