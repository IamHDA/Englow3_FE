"use client";

import { BarChart3, BookOpen } from "lucide-react";
import { PageHeader, PageTabs } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DictationHeaderProps {
  activeTab: "lessons" | "stats";
  onTabChange: (tab: "lessons" | "stats") => void;
}

export function DictationHeader({
  activeTab,
  onTabChange,
}: DictationHeaderProps) {
  const { t } = useLanguage();

  return (
    <PageHeader
      title={t.dictation.title}
      actions={
        <PageTabs
          value={activeTab}
          onChange={onTabChange}
          tabs={[
            {
              value: "lessons",
              label: t.dictation.lessonsTab,
              icon: <BookOpen size={16} />,
            },
            {
              value: "stats",
              label: t.dictation.statsTab,
              icon: <BarChart3 size={16} />,
            },
          ]}
        />
      }
    />
  );
}
