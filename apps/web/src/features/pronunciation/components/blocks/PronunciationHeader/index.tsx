"use client";

import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function PronunciationHeader() {
  const { t } = useLanguage();

  return <PageHeader title={t.pronunciation.title} />;
}
