import { Group, Skeleton, Stack } from "@mantine/core";

/** The dropdown's rows on their way: a few people, if there are any to look for, and a few posts. */
export function SearchSuggestionsSkeleton({
  showPeople,
}: {
  showPeople: boolean;
}) {
  return (
    <Stack gap="sm" p="sm" aria-hidden="true">
      {showPeople &&
        [0, 1].map((index) => (
          <Group key={`person-${index}`} gap="sm" wrap="nowrap">
            <Skeleton circle height={36} width={36} />
            <Skeleton height={16} width="45%" radius="sm" />
          </Group>
        ))}
      {[0, 1, 2].map((index) => (
        <Stack key={`post-${index}`} gap={6}>
          <Skeleton height={16} width="70%" radius="sm" />
          <Skeleton height={12} width="35%" radius="sm" />
        </Stack>
      ))}
    </Stack>
  );
}
