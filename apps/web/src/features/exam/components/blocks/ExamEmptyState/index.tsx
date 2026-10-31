import { Button, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Search } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";

type ExamEmptyStateProps = {
  searchQuery?: string;
  onResetFilters: () => void;
};

export function ExamEmptyState({
  searchQuery,
  onResetFilters,
}: ExamEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <Paper
      withBorder
      radius="lg"
      p={{ base: "xl", sm: 54 }}
      shadow="xs"
      bg="white"
    >
      <Stack align="center" gap="md" ta="center">
        <ThemeIcon size={64} radius="xl" variant="light" color="blue">
          <Search size={28} aria-hidden="true" />
        </ThemeIcon>

        <Title order={3} fw={700} c="navy.9">
          {t.exam.emptyTitle}
        </Title>

        <Text c="dimmed" size="sm" maw={460} lh={1.6}>
          {searchQuery
            ? t.exam.emptySearchDesc.replace("{query}", searchQuery)
            : t.exam.emptyFilterDesc}
        </Text>

        <Button
          variant="filled"
          color="navy.9"
          radius="xl"
          size="sm"
          mt="xs"
          onClick={onResetFilters}
        >
          {t.exam.clearAllFilters}
        </Button>
      </Stack>
    </Paper>
  );
}
