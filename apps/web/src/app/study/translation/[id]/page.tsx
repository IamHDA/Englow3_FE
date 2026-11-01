import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TranslationPracticeView } from "@/features/translation/components/views/TranslationPracticeView";
import { isWellFormedId } from "@/shared/network/loadError";

export const metadata: Metadata = { title: "Luyện dịch | Englow3" };

export default async function TranslationPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isWellFormedId(id)) notFound();
  return <TranslationPracticeView id={id} />;
}
