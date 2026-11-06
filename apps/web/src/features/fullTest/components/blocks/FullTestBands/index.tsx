import { Badge, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import type { FullTestSittingFieldsFragment } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * The four skill bands, and the band the sitting gives: the overall one once
 * every part is graded, until then the provisional one (the lower of Listening
 * and Reading), marked as such. Every figure is the backend's; nothing is
 * worked out here.
 */
export function FullTestBands({
  sitting,
}: {
  sitting: FullTestSittingFieldsFragment;
}) {
  const { isVi } = useLanguage();
  const skills = [
    { name: "Listening", band: sitting.listeningBand },
    { name: "Reading", band: sitting.readingBand },
    { name: "Writing", band: sitting.writingBand },
    { name: "Speaking", band: sitting.speakingBand },
  ];
  const headline = sitting.overallBand ?? sitting.provisionalBand;

  return (
    <Card withBorder radius="lg" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end">
          <Stack gap={2}>
            <Text size="sm" c="dimmed">
              {sitting.overallBand !== null && sitting.overallBand !== undefined
                ? isVi
                  ? "Band tổng (ước tính)"
                  : "Overall band (estimate)"
                : isVi
                  ? "Band tạm, chỉ dựa trên Listening và Reading"
                  : "Provisional band, from Listening and Reading only"}
            </Text>
            <Text fw={800} fz={40} c="navy.9" lh={1}>
              {headline !== null && headline !== undefined
                ? headline.toFixed(1)
                : "—"}
            </Text>
          </Stack>
          {sitting.overallBand === null && sitting.provisionalBand !== null && (
            <Badge variant="light" color="yellow">
              {isVi ? "Tạm thời" : "Provisional"}
            </Badge>
          )}
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {skills.map((skill) => (
            <Card key={skill.name} withBorder radius="md" p="sm">
              <Text size="xs" c="dimmed" fw={600}>
                {skill.name}
              </Text>
              <Text fw={700} size="lg">
                {skill.band !== null && skill.band !== undefined
                  ? skill.band.toFixed(1)
                  : "—"}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}
