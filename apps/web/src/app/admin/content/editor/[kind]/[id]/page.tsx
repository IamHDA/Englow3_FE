import { notFound } from "next/navigation";
import { ContentEditorView } from "@/features/content/components/views/ContentEditorView";
import type { AuthoringKind } from "@/features/content/types/authoring";
export default async function Page({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (
    ![
      "FLASHCARD_SET",
      "QUIZ",
      "DICTATION_LESSON",
      "SPEAKING_PROMPT",
      "EXAM",
    ].includes(kind) ||
    (id !== "new" && !/^[0-9a-f-]{36}$/i.test(id))
  )
    notFound();
  return (
    <ContentEditorView
      kind={kind as AuthoringKind}
      id={id === "new" ? undefined : id}
    />
  );
}
