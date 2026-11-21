"use client";

import {
  Button,
  Chip,
  Flex,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

import { BlogPostSort } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { tagLabel } from "../../parts/TagBadges";

import classes from "./ListFilters.module.css";

type ListFiltersProps = {
  sort: BlogPostSort;
  onSort: (sort: BlogPostSort) => void;
  /** The levels and certificates of the tag catalogue, or null while it loads. */
  levels: string[] | null;
  level: string | null;
  onLevel: (level: string | null) => void;
  certificates: string[] | null;
  certificate: string | null;
  onCertificate: (certificate: string | null) => void;
  /** Whether anything narrows the list, to offer taking it all off. */
  narrowed: boolean;
  onClear: () => void;
};

/** The column beside the list: how it is ordered, and the level and the certificate to narrow it to. */
export function ListFilters({
  sort,
  onSort,
  levels,
  level,
  onLevel,
  certificates,
  certificate,
  onCertificate,
  narrowed,
  onClear,
}: ListFiltersProps) {
  const { t } = useLanguage();
  const copy = t.blog.list.filters;

  return (
    <Flex component="aside" direction="column" gap="xl">
      <Stack gap="sm">
        <Text component="h2" className={classes.heading}>
          {copy.sort}
        </Text>
        <SegmentedControl
          aria-label={copy.sort}
          w="fit-content"
          value={sort}
          onChange={(next) =>
            onSort(
              next === BlogPostSort.MOST_LIKED
                ? BlogPostSort.MOST_LIKED
                : BlogPostSort.NEWEST,
            )
          }
          data={[
            { value: BlogPostSort.NEWEST, label: copy.newest },
            { value: BlogPostSort.MOST_LIKED, label: copy.mostLiked },
          ]}
        />
      </Stack>

      <TagFilter
        heading={copy.level}
        values={levels}
        chosen={level}
        onChoose={onLevel}
      />
      <TagFilter
        heading={copy.certificate}
        values={certificates}
        chosen={certificate}
        onChoose={onCertificate}
      />

      {narrowed && (
        <Button
          variant="subtle"
          size="compact-md"
          w="fit-content"
          onClick={onClear}
        >
          {copy.clear}
        </Button>
      )}
    </Flex>
  );
}

type TagFilterProps = {
  heading: string;
  /** Null while the catalogue is on its way. */
  values: string[] | null;
  chosen: string | null;
  onChoose: (value: string | null) => void;
};

/** One tag kind as a row of chips; pressing the chosen one takes it off. */
function TagFilter({ heading, values, chosen, onChoose }: TagFilterProps) {
  const { t } = useLanguage();
  return (
    <Stack gap="sm">
      <Text component="h2" className={classes.heading}>
        {heading}
      </Text>
      {values === null ? (
        <Group gap="xs" aria-hidden="true">
          <Skeleton height={36} width={48} radius="md" />
          <Skeleton height={36} width={48} radius="md" />
          <Skeleton height={36} width={48} radius="md" />
        </Group>
      ) : (
        <Group gap="xs" role="group" aria-label={heading}>
          {values.map((value) => (
            <Chip
              key={value}
              checked={chosen === value}
              onChange={() => onChoose(chosen === value ? null : value)}
              variant="outline"
              size="md"
            >
              {tagLabel(t.blog, value)}
            </Chip>
          ))}
        </Group>
      )}
    </Stack>
  );
}
