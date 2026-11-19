"use client";

import { Badge, Group } from "@mantine/core";

import type { BlogTranslations } from "@/shared/constants/translations";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { BlogTagData } from "../../../types";

/** A tag in the interface language, or as the catalogue spells it when nobody wrote words for it (a value added to the backend). */
export function tagLabel(copy: BlogTranslations, value: string): string {
  return Object.hasOwn(copy.tags.values, value)
    ? copy.tags.values[value]
    : value;
}

/** A post's tags, one small badge each, in the order the backend gives them. */
export function TagBadges({ tags }: { tags: BlogTagData[] }) {
  const { t } = useLanguage();
  if (tags.length === 0) return null;
  return (
    <Group gap={6}>
      {tags.map((tag) => (
        <Badge
          key={`${tag.kind}:${tag.value}`}
          variant="light"
          color="brand"
          size="sm"
          radius="sm"
        >
          {tagLabel(t.blog, tag.value)}
        </Badge>
      ))}
    </Group>
  );
}
