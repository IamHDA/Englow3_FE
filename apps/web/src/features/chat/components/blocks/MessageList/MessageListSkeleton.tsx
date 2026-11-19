import { Flex, Skeleton, Stack } from "@mantine/core";

/** The messages of a conversation on its way: bubbles from both sides, in the sizes messages come in. */
export function MessageListSkeleton() {
  const bubbles = [
    { mine: false, width: 220, height: 40 },
    { mine: false, width: 140, height: 40 },
    { mine: true, width: 260, height: 56 },
    { mine: false, width: 180, height: 40 },
    { mine: true, width: 120, height: 40 },
    { mine: true, width: 200, height: 40 },
  ];
  return (
    <Stack gap="sm" p="md" aria-hidden="true">
      {bubbles.map(({ mine, width, height }, index) => (
        <Flex key={index} justify={mine ? "flex-end" : "flex-start"}>
          <Skeleton height={height} width={width} maw="80%" radius="lg" />
        </Flex>
      ))}
    </Stack>
  );
}
