import { Group, Paper, Skeleton } from "@mantine/core";
import type { ReactNode } from "react";

import classes from "./PeoplePanel.module.css";

/**
 * The card on the right of /friends before it knows what to say: the heading
 * as a bar, and the rows' own skeleton inside. The page's own skeleton uses
 * it; a list that is still loading keeps the real heading instead.
 */
export function PeoplePanelSkeleton({ children }: { children: ReactNode }) {
  return (
    <Paper component="section" withBorder className={classes.panel}>
      <Group
        className={classes.header}
        justify="space-between"
        gap="xs md"
        px="lg"
        py="md"
      >
        <Skeleton height={26} width={180} radius="sm" />
        <Skeleton height={14} width={72} radius="sm" />
      </Group>
      {children}
    </Paper>
  );
}
