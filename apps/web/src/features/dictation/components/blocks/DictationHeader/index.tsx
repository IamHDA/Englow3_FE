"use client";

import { Anchor, Badge, Breadcrumbs, Group, Stack, Tabs, Text, Title } from "@mantine/core";
import { BarChart3, BookOpen, ChevronRight, Headphones } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DictationHeaderProps {
  activeTab: "lessons" | "stats";
  onTabChange: (tab: "lessons" | "stats") => void;
}

export function DictationHeader({ activeTab, onTabChange }: DictationHeaderProps) {
  const { t } = useLanguage();

  return (
    <Stack gap="md" pt="md" pb="sm">
      <Breadcrumbs
        separator={<ChevronRight size={14} color="var(--mantine-color-ink-4)" />}
        styles={{ breadcrumb: { fontSize: 13 } }}
      >
        <Anchor component={Link} href="/" c="ink.6" fw={500}>
          {t.nav.home}
        </Anchor>
        <Anchor component={Link} href="/study/dictation" c="ink.6" fw={500}>
          {t.nav.study}
        </Anchor>
        <Text c="navy.9" fw={600} size="xs">
          {t.dictation.title}
        </Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Group gap="xs" align="center">
            <Badge
              leftSection={<Headphones size={13} />}
              variant="light"
              color="navy"
              size="md"
              radius="sm"
            >
              {t.dictation.listeningBadge}
            </Badge>
          </Group>
          <Title order={1} size="h2" c="ink.9" fw={700}>
            {t.dictation.title}
          </Title>
          <Text size="sm" c="ink.6">
            {t.dictation.subtitle}
          </Text>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(val) => onTabChange((val as "lessons" | "stats") || "lessons")}
          variant="pills"
          radius="md"
        >
          <Tabs.List>
            <Tabs.Tab
              value="lessons"
              leftSection={<BookOpen size={16} />}
              fw={600}
              c={activeTab === "lessons" ? "white" : "ink.7"}
            >
              {t.dictation.lessonsTab}
            </Tabs.Tab>
            <Tabs.Tab
              value="stats"
              leftSection={<BarChart3 size={16} />}
              fw={600}
              c={activeTab === "stats" ? "white" : "ink.7"}
            >
              {t.dictation.statsTab}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>
    </Stack>
  );
}
