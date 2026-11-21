"use client";

import { Button, Flex, Paper, Text } from "@mantine/core";
import { PenLine } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";

/** What the recommendations say when there is nothing to recommend: an invitation to write the first post. */
export function RecommendationsIntro() {
  const { t } = useLanguage();
  return (
    <Paper
      withBorder
      radius={20}
      p="xl"
      bg="white"
      style={{ borderStyle: "dashed" }}
    >
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap="md"
        align={{ base: "flex-start", sm: "center" }}
        justify="space-between"
      >
        <Flex direction="column" gap={4} maw={560}>
          <Text fw={700} c="navy.9">
            {t.blog.recommended.emptyTitle}
          </Text>
          <Text c="ink.6">{t.blog.recommended.emptyDescription}</Text>
        </Flex>
        <Button
          component={Link}
          href={BLOG_ROUTES.write}
          leftSection={<PenLine size={16} aria-hidden="true" />}
        >
          {t.blog.list.write}
        </Button>
      </Flex>
    </Paper>
  );
}
