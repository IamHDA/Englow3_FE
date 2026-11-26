import { Redirect, useLocalSearchParams } from "expo-router";

import { ContentEditor } from "@/features/content/ContentEditor";
import { isAuthoringKind } from "@/features/content/document";
import { TranslationEditor } from "@/features/translation/TranslationEditor";

/** One authoring screen for every content kind; `id` is "new" for a fresh draft. */
export default function ContentEditorScreen() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id: string }>();
  if (!kind || !isAuthoringKind(kind) || !id) return <Redirect href="/admin" />;
  if (kind === "TRANSLATION_SET") return <TranslationEditor key={id} id={id} />;
  return <ContentEditor key={`${kind}:${id}`} kind={kind} id={id} />;
}
