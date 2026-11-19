"use client";

import { Flex } from "@mantine/core";

import type { ModerationQueueItemData } from "../../../types";

import classes from "./ModerationQueueList.module.css";
import { ModerationQueueRow } from "./ModerationQueueRow";

/** The queue of one page: a row for each piece of reported content. */
export function ModerationQueueList({
  items,
}: {
  items: ModerationQueueItemData[];
}) {
  return (
    <Flex component="ul" direction="column" gap="sm" className={classes.list}>
      {items.map((item) => (
        <ModerationQueueRow
          key={`${item.targetType}:${item.targetId}`}
          item={item}
        />
      ))}
    </Flex>
  );
}
