"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Text,
} from "@mantine/core";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../../constants/blog";
import {
  RELATIONSHIP_COLOR,
  RELATIONSHIP_KEY,
} from "../../../../constants/blogLabels";
import type { PersonSuggestionData, SuggestionGroup } from "../../../../types";

import classes from "../Suggestions.module.css";

type PeopleSuggestionsProps = {
  group: SuggestionGroup<PersonSuggestionData>;
  /** The word searched for, which "Xem tất cả" carries to the friends screen. */
  term: string;
  onNavigate: () => void;
};

/**
 * The people of the dropdown: the first few learners whose name matches, each
 * with what they are to the viewer, and "Xem tất cả" for the people search of
 * the friends screen.
 */
export function PeopleSuggestions({
  group,
  term,
  onNavigate,
}: PeopleSuggestionsProps) {
  const { t } = useLanguage();
  const copy = t.blog.search;

  return (
    <Flex
      component="section"
      direction="column"
      aria-label={copy.peopleHeading}
    >
      <Group justify="space-between" gap="xs" px="sm" pt="xs">
        <Text component="h3" className={classes.heading}>
          {group.status === "ready"
            ? copy.peopleCount.replace("{count}", String(group.total))
            : copy.peopleHeading}
        </Text>
        {group.status === "ready" && (
          <Button
            component={Link}
            href={BLOG_ROUTES.friendsSearch(term)}
            variant="subtle"
            size="compact-sm"
            onClick={onNavigate}
          >
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
          {group.items.map((person) => {
            const relationship = RELATIONSHIP_KEY[person.relationship];
            return (
              <li key={person.userId}>
                <Anchor
                  component={Link}
                  href={BLOG_ROUTES.wall(person.userId)}
                  className={classes.row}
                  data-result=""
                  underline="never"
                  onClick={onNavigate}
                >
                  <Avatar
                    src={person.avatarUrl}
                    name={person.displayName}
                    radius="xl"
                    size={36}
                    aria-hidden="true"
                  />
                  <Text fw={600} c="navy.9" truncate flex={1} miw={0}>
                    {person.displayName}
                  </Text>
                  {relationship && (
                    <Badge
                      variant="light"
                      color={RELATIONSHIP_COLOR[relationship]}
                      size="sm"
                    >
                      {copy.relationship[relationship]}
                    </Badge>
                  )}
                </Anchor>
              </li>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}
