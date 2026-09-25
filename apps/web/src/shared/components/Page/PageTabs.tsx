"use client";

import { Group, SegmentedControl } from "@mantine/core";
import type { ReactNode } from "react";

type PageTab<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

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
      value={value}
      onChange={(next) => onChange(next as T)}
      data={tabs.map((tab) => ({
        value: tab.value,
        label: (
          <Group gap={6} wrap="nowrap" justify="center">
            {tab.icon}
            <span>{tab.label}</span>
          </Group>
        ),
      }))}
    />
  );
}
