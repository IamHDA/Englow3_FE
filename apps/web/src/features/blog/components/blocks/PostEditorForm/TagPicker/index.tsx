"use client";

import { MultiSelect, SimpleGrid } from "@mantine/core";

import { BlogTagKind } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { TAG_KINDS, TAG_KIND_KEY } from "../../../../constants/blogLabels";
import type { BlogTagCatalogueData } from "../../../../types";
import { tagLabel } from "../../../parts/TagBadges";

/** A tag as the form holds it: which kind of word it is, and the word. */
export type TagValue = { kind: BlogTagKind; value: string };

type TagPickerProps = {
  value: TagValue[];
  onChange: (tags: TagValue[]) => void;
  catalogue: BlogTagCatalogueData;
};

/** The words the catalogue offers for each kind of tag. */
function wordsOf(catalogue: BlogTagCatalogueData, kind: BlogTagKind): string[] {
  switch (kind) {
    case BlogTagKind.SKILL:
      return catalogue.skills;
    case BlogTagKind.LEVEL:
      return catalogue.levels;
    case BlogTagKind.CERTIFICATE:
      return catalogue.certificates;
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}

/**
 * One multi-select for each kind of tag - skill, level, certificate - with the
 * words the backend's catalogue gives, shown in the interface language. They
 * all write into one list of tags, which is what a post holds; how many are
 * allowed is the form's rule, not this picker's.
 */
export function TagPicker({ value, onChange, catalogue }: TagPickerProps) {
  const { t } = useLanguage();

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
      {TAG_KINDS.map((kind) => (
        <MultiSelect
          key={kind}
          label={t.blog.tags.kinds[TAG_KIND_KEY[kind]]}
          placeholder={t.blog.editor.tags.placeholder}
          data={wordsOf(catalogue, kind).map((word) => ({
            value: word,
            label: tagLabel(t.blog, word),
          }))}
          value={value
            .filter((tag) => tag.kind === kind)
            .map((tag) => tag.value)}
          onChange={(words) =>
            onChange([
              ...value.filter((tag) => tag.kind !== kind),
              ...words.map((word) => ({ kind, value: word })),
            ])
          }
          clearable
          hidePickedOptions
          comboboxProps={{ withinPortal: true }}
        />
      ))}
    </SimpleGrid>
  );
}
