import { Box, Group, Stack, Title } from "@mantine/core";
import type { ReactNode } from "react";

import classes from "./Page.module.css";

/**
 * Two widths for the whole app, and nothing in between.
 *
 * `wide` for libraries, lists, statistics and dashboards; `focus` for the
 * screens where the learner does one thing - a card, a sentence, a paper -
 * and a wide line would only put distance between the eye and the work.
 * Before this, pages were built at five widths (960 to 1360) and each looked a
 * different size from the one before it.
 */
export type PageWidth = "wide" | "focus";

type PageProps = {
  width?: PageWidth;
  children: ReactNode;
};

export function Page({ width = "wide", children }: PageProps) {
  return (
    <Box className={classes.page} data-width={width}>
      <Stack gap="lg">{children}</Stack>
    </Box>
  );
}

type PageHeaderProps = {
  title: ReactNode;
  /** Buttons or tabs that act on the whole page, on the right. */
  actions?: ReactNode;
  /** Above the title, e.g. breadcrumbs. */
  above?: ReactNode;
};

/**
 * Every page's heading, the same size in the same place. Actions sit on the
 * right and drop under the title on a phone rather than squeezing it.
 */
export function PageHeader({ title, actions, above }: PageHeaderProps) {
  return (
    <Stack gap="xs">
      {above}
      <Group
        justify="space-between"
        align="center"
        gap="md"
        className={classes.headerRow}
      >
        <Title order={1} className={classes.title}>
          {title}
        </Title>
        {actions && <Box className={classes.actions}>{actions}</Box>}
      </Group>
    </Stack>
  );
}
