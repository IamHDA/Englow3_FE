"use client";

import { Divider, Flex, Group, Stack, Text } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import type {
  BlogPostSummaryData,
  BlogRecommendationData,
} from "../../../types";

import { CompactPost } from "./CompactPost";
import { FeaturedPost } from "./FeaturedPost";
import { RecommendationsIntro } from "./RecommendationsIntro";

type RecommendedPostsProps = {
  recommendations: BlogRecommendationData[];
  /** The post whose save or unsave is on its way, if any. */
  savingId: string | null;
  onToggleSave: (post: BlogPostSummaryData) => void;
};

/**
 * "Gợi ý cho bạn": the best post large and the next ones small, each with why
 * it is recommended. With nothing to recommend it is an invitation to write
 * instead, so the top of the page never reads as broken.
 */
export function RecommendedPosts({
  recommendations,
  savingId,
  onToggleSave,
}: RecommendedPostsProps) {
  const { t } = useLanguage();
  const [featured, ...others] = recommendations;

  return (
    <Flex
      component="section"
      direction="column"
      gap="md"
      aria-label={t.blog.recommended.heading}
    >
      <Group gap="sm" wrap="nowrap">
        <Text
          component="h2"
          size="xs"
          fw={600}
          c="orange.7"
          tt="uppercase"
          lts="0.08em"
          ff="heading"
          m={0}
        >
          {t.blog.recommended.heading}
        </Text>
        <Divider flex={1} />
      </Group>

      {featured ? (
        <Flex gap="lg" wrap="wrap" align="stretch">
          <FeaturedPost
            recommendation={featured}
            savePending={savingId === featured.post.id}
            onToggleSave={() => onToggleSave(featured.post)}
          />
          {others.length > 0 && (
            <Stack gap="md" flex="1 1 300px" maw={{ md: 400 }} miw={0}>
              {others.map((recommendation) => (
                <CompactPost
                  key={recommendation.post.id}
                  recommendation={recommendation}
                  savePending={savingId === recommendation.post.id}
                  onToggleSave={() => onToggleSave(recommendation.post)}
                />
              ))}
            </Stack>
          )}
        </Flex>
      ) : (
        <RecommendationsIntro />
      )}
    </Flex>
  );
}
