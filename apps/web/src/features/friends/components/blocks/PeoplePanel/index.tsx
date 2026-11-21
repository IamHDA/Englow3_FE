"use client";

import { Group, Paper, Text, Title } from "@mantine/core";
import { useId, type ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./PeoplePanel.module.css";

type PeoplePanelProps = {
  /** What the list is: the heading, and the name of the region for a screen reader. */
  title: string;
  /** How many people the list has in all, once the server has said. */
  count?: number;
  /** With `count`: what a search was for, so the heading says "3 results for ..." rather than "3 people". */
  term?: string;
  /** The rows, or what stands in for them: a skeleton, an empty state, an error. */
  children: ReactNode;
};

/**
 * The card on the right of /friends: a heading with how many people the list
 * has, and under it whatever the list shows. Every list - friends, requests,
 * blocked, search results - sits in this one frame, so switching between
 * them moves nothing but the rows.
 */
export function PeoplePanel({
  title,
  count,
  term,
  children,
}: PeoplePanelProps) {
  const { list, search } = useLanguage().t.friends;
  const titleId = useId();

  const single = count === 1;
  const template =
    term === undefined
      ? single
        ? list.countOne
        : list.countOther
      : single
        ? search.resultsOne
        : search.resultsOther;
  const summary =
    count === undefined
      ? null
      : template
          .replace("{count}", String(count))
          .replace("{term}", () => term ?? "");

  return (
    <Paper
      component="section"
      withBorder
      className={classes.panel}
      aria-labelledby={titleId}
    >
      <Group
        className={classes.header}
        justify="space-between"
        gap="xs md"
        px="lg"
        py="md"
      >
        <Title order={2} size="h3" c="navy.9" id={titleId}>
          {title}
        </Title>
        {/* A count that arrives after the rows is news to a screen reader. */}
        <Text size="sm" c="ink.5" aria-live="polite">
          {summary}
        </Text>
      </Group>
      {children}
    </Paper>
  );
}
