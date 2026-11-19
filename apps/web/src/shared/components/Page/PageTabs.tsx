"use client";

import { Badge, Group, SegmentedControl } from "@mantine/core";
import type { ReactNode } from "react";

import classes from "./PageTabs.module.css";

type PageTab<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** How many things wait behind the tab. Nothing is drawn for 0 or for no count. */
  count?: number;
};

/** Past this the number on a tab reads "99+": it has to stay a few characters wide. */
const TAB_COUNT_MAX = 99;

type PageTabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  tabs: PageTab<T>[];
};

/**
 * The switch between a page's views - a library and its statistics, today's
 * path and the quiz collection. One control for all of them, where there were
 * three (segmented, pills, segmented again) that each looked different.
 * Full width on a phone, where it sits on its own line under the title.
 */
export function PageTabs<T extends string>({
  value,
  onChange,
  tabs,
}: PageTabsProps<T>) {
  return (
    <SegmentedControl
      fullWidth
      radius="md"
      classNames={{ root: classes.root, control: classes.control }}
      value={value}
      onChange={(next) => onChange(next as T)}
      data={tabs.map((tab) => ({
        value: tab.value,
        label: (
          <Group gap={6} wrap="nowrap" justify="center">
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count ? (
              // flex="none": inside a full-width control the badge is what a
              // squeezed row shrank first, down to a capsule with no number.
              <Badge size="xs" variant="filled" color="navy" px={6} flex="none">
                {tab.count > TAB_COUNT_MAX ? `${TAB_COUNT_MAX}+` : tab.count}
              </Badge>
            ) : null}
          </Group>
        ),
      }))}
    />
  );
}
