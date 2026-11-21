import { Flex, Group, Paper, Skeleton, Stack } from "@mantine/core";

import classes from "./PersonListSkeleton.module.css";

type PersonListSkeletonProps = {
  rows: number;
  /** Widths of the buttons at the end of each row, in pixels. */
  actionWidths: number[];
};

/**
 * The shape of a list of people: picture, two lines of text, buttons. Every
 * list has it, only the buttons differ, so each list's own named skeleton is
 * this with its buttons.
 */
export function PersonListSkeleton({
  rows,
  actionWidths,
}: PersonListSkeletonProps) {
  return (
    <Paper withBorder radius="lg">
      <Stack gap={0}>
        {Array.from({ length: rows }, (_, row) => (
          <Flex
            key={row}
            className={classes.row}
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
            justify="space-between"
            gap="md"
            px="lg"
            py="md"
          >
            <Group gap="md" wrap="nowrap">
              <Skeleton circle height={52} width={52} />
              <Stack gap={6}>
                <Skeleton height={18} width={160} radius="sm" />
                <Skeleton height={14} width={110} radius="sm" />
              </Stack>
            </Group>
            <Group gap="xs" wrap="nowrap">
              {actionWidths.map((width, index) => (
                <Skeleton key={index} height={36} width={width} radius="md" />
              ))}
            </Group>
          </Flex>
        ))}
      </Stack>
    </Paper>
  );
}
