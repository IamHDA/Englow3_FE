"use client";

import { Anchor, Group, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";
import { recommendationReason } from "../../../../constants/blogLabels";
import type { BlogRecommendationData } from "../../../../types";
import { TagBadges, tagLabel } from "../../../parts/TagBadges";
import { SaveButton } from "../../SaveButton";

type CompactPostProps = {
  recommendation: BlogRecommendationData;
  savePending: boolean;
  onToggleSave: () => void;
};

/** A smaller recommendation beside the large one: why, the title, two lines of excerpt and the tags. */
export function CompactPost({
  recommendation,
  savePending,
  onToggleSave,
}: CompactPostProps) {
  const { t } = useLanguage();
  const { post, kind, matchedTags } = recommendation;
  const reason = recommendationReason(t.blog, kind, matchedTags, (value) =>
    tagLabel(t.blog, value),
  );

  return (
    <Paper
      component="article"
      withBorder
      radius="xl"
      px={22}
      py={20}
      flex={1}
      miw={0}
    >
      <Stack gap={10} h="100%">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text size="xs" fw={600} c="brand.7">
            {reason}
          </Text>
          <SaveButton
            saved={post.savedByMe}
            pending={savePending}
            onToggle={onToggleSave}
          />
        </Group>
        <Title order={3} fz={19} lh={1.35}>
          <Anchor
            component={Link}
            href={BLOG_ROUTES.post(post.id)}
            c="navy.9"
            underline="never"
            inherit
          >
            {post.title}
          </Anchor>
        </Title>
        {post.excerpt && (
          <Text size="sm" c="ink.6" lineClamp={2}>
            {post.excerpt}
          </Text>
        )}
        <TagBadges tags={post.tags} />
      </Stack>
    </Paper>
  );
}
