"use client";

import { Anchor, Button, Flex, Group, Stack, Text } from "@mantine/core";
import { FileText } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";
import type { PostSuggestionData, SuggestionGroup } from "../../../../types";
import { TagBadges } from "../../../parts/TagBadges";
import { Timestamp } from "../../../parts/Timestamp";

import classes from "../Suggestions.module.css";

type PostSuggestionsProps = {
  group: SuggestionGroup<PostSuggestionData>;
  /** "Xem tất cả": the word searched for becomes the list's own filter. */
  onViewAll: () => void;
  onNavigate: () => void;
};

/** The posts of the dropdown: the first few titles that match, each with its tags and date, and "Xem tất cả" for the list. */
export function PostSuggestions({
  group,
  onViewAll,
  onNavigate,
}: PostSuggestionsProps) {
  const { t } = useLanguage();
  const copy = t.blog.search;

  return (
    <Flex component="section" direction="column" aria-label={copy.postsHeading}>
      <Group justify="space-between" gap="xs" px="sm" pt="xs">
        <Text component="h3" className={classes.heading}>
          {group.status === "ready"
            ? copy.postsCount.replace("{count}", String(group.total))
            : copy.postsHeading}
        </Text>
        {group.status === "ready" && (
          <Button variant="subtle" size="compact-sm" onClick={onViewAll}>
            {copy.viewAll}
          </Button>
        )}
      </Group>
      {group.status === "failed" && (
        <Text size="sm" c="ink.6" px="sm" py="xs">
          {copy.loadError}
        </Text>
      )}
      {group.status === "ready" && (
        <Flex component="ul" direction="column" className={classes.list}>
          {group.items.map((post) => (
            <li key={post.id}>
              <Anchor
                component={Link}
                href={BLOG_ROUTES.post(post.id)}
                className={classes.row}
                data-result=""
                underline="never"
                onClick={onNavigate}
              >
                <FileText
                  size={18}
                  aria-hidden="true"
                  className={classes.icon}
                />
                <Stack gap={4} flex={1} miw={0}>
                  <Text fw={600} c="navy.9">
                    {post.title}
                  </Text>
                  <Group gap="xs">
                    <TagBadges tags={post.tags} />
                    <Timestamp value={post.createdAt} size="sm" />
                  </Group>
                </Stack>
              </Anchor>
            </li>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
