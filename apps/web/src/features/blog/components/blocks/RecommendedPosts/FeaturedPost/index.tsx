"use client";

import {
  Anchor,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";
import { recommendationReason } from "../../../../constants/blogLabels";
import type { BlogRecommendationData } from "../../../../types";
import { AuthorChip } from "../../../parts/AuthorChip";
import { TagBadges, tagLabel } from "../../../parts/TagBadges";
import { Timestamp } from "../../../parts/Timestamp";
import { SaveButton } from "../../SaveButton";

type FeaturedPostProps = {
  recommendation: BlogRecommendationData;
  savePending: boolean;
  onToggleSave: () => void;
};

/** The best recommendation, large: why, the title, three lines of excerpt, the tags, the author and the way in. */
export function FeaturedPost({
  recommendation,
  savePending,
  onToggleSave,
}: FeaturedPostProps) {
  const { t } = useLanguage();
  const { post, kind, matchedTags } = recommendation;
  const reason = recommendationReason(t.blog, kind, matchedTags, (value) =>
    tagLabel(t.blog, value),
  );

  return (
    <Paper
      component="article"
      withBorder
      radius={20}
      p={{ base: "lg", md: 32 }}
      flex="999 1 520px"
      miw={0}
    >
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap={6} c="brand.7" wrap="nowrap">
            <Target size={16} aria-hidden="true" />
            <Text size="sm" fw={600} c="brand.7">
              {reason}
            </Text>
          </Group>
          <SaveButton
            saved={post.savedByMe}
            pending={savePending}
            onToggle={onToggleSave}
          />
        </Group>
        <Title order={2} fz={{ base: 28, md: 40 }} lh={1.15} fw={700}>
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
          <Text c="ink.6" fz={{ base: 16, md: 18 }} lineClamp={3}>
            {post.excerpt}
          </Text>
        )}
        <TagBadges tags={post.tags} />
        <Stack gap="sm" mt="auto">
          <Divider />
          <Flex gap="sm" wrap="wrap" align="center" justify="space-between">
            <Group gap="xs" c="ink.5">
              <AuthorChip author={post.author} size={32} />
              <Text span aria-hidden="true">
                ·
              </Text>
              <Timestamp value={post.createdAt} size="sm" />
            </Group>
            <Button
              component={Link}
              href={BLOG_ROUTES.post(post.id)}
              variant="subtle"
              rightSection={<ArrowRight size={18} aria-hidden="true" />}
            >
              {t.blog.recommended.read}
            </Button>
          </Flex>
        </Stack>
      </Stack>
    </Paper>
  );
}
