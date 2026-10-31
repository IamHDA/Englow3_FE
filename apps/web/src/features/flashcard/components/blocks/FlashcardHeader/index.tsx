"use client";

import { IconCards, IconChartBar } from "@tabler/icons-react";
import { PageHeader, PageTabs } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardHeaderProps {
  activeTab: "decks" | "stats";
  onTabChange: (tab: "decks" | "stats") => void;
}

export function FlashcardHeader({
  activeTab,
  onTabChange,
}: FlashcardHeaderProps) {
  const { t } = useLanguage();

  return (
    <PageHeader
      title={t.flashcard.title}
      actions={
        <PageTabs
          value={activeTab}
          onChange={onTabChange}
          tabs={[
            {
              value: "decks",
              label: t.flashcard.decksTab,
              icon: <IconCards size={16} />,
            },
            {
              value: "stats",
              label: t.flashcard.statsTab,
              icon: <IconChartBar size={16} />,
            },
          ]}
        />
      }
    />
  );
}
