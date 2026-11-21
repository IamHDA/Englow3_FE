"use client";

import { Chip, Group, ScrollArea } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { ALL_TOPICS } from "../../../constants/blog";
import { tagLabel } from "../../parts/TagBadges";

type TopicChipsProps = {
  /** The skills of the tag catalogue. */
  skills: string[];
  /** The skill chosen, or null for every topic. */
  value: string | null;
  onChange: (skill: string | null) => void;
};

/** The row of topics above the list: all of them, or one skill. One at a time; it scrolls sideways on a phone. */
export function TopicChips({ skills, value, onChange }: TopicChipsProps) {
  const { t } = useLanguage();
  const copy = t.blog.list.topics;
  return (
    <ScrollArea type="auto" scrollbars="x" offsetScrollbars="x">
      <Chip.Group
        value={value ?? ALL_TOPICS}
        onChange={(next) => onChange(next === ALL_TOPICS ? null : next)}
      >
        <Group gap="xs" wrap="nowrap" role="group" aria-label={copy.label}>
          <Chip value={ALL_TOPICS} variant="filled" color="navy" size="md">
            {copy.all}
          </Chip>
          {skills.map((skill) => (
            <Chip
              key={skill}
              value={skill}
              variant="filled"
              color="navy"
              size="md"
            >
              {tagLabel(t.blog, skill)}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </ScrollArea>
  );
}
