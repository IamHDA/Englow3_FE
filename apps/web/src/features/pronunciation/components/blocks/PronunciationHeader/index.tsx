"use client";

import { Title } from "@mantine/core";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function PronunciationHeader() {
  const { t } = useLanguage();

  return (
    <Title order={2} fw={800} c="dark.9">
      {t.pronunciation.title}
    </Title>
  );
}
