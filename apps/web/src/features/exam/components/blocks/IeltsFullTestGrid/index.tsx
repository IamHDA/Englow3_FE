"use client";

import { Button, Center, SimpleGrid, Stack, Text, Title } from "@mantine/core";

import { useIeltsFullTestCatalogueQuery } from "@/lib/graphql/generated/hooks";
import type { CertificateVariant } from "@/lib/graphql/generated/schemaTypes";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { ExamLibrarySkeleton } from "../ExamLibrarySkeleton";
import { FullTestCard } from "../FullTestCard";

type IeltsFullTestGridProps = {
  /** Academic or General; unset lists both, as the "all" tab does. */
  variant?: CertificateVariant;
  /** The library's search box, matched against the title. */
  searchQuery: string;
  /**
   * Set on the "all" tab, where the full tests sit above the papers under a
   * heading of their own, and an empty list says nothing at all.
   */
  heading?: string;
};

/**
 * The IELTS side of the library. IELTS has no stand-alone papers, so its tabs
 * list full tests (D-IELTS-11). The backend returns them all at once, newest
 * first - a handful, so filtering by variant and title happens here.
 */
export function IeltsFullTestGrid({
  variant,
  searchQuery,
  heading,
}: IeltsFullTestGridProps) {
  const { t, isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error, refetch } = useIeltsFullTestCatalogueQuery({
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return heading ? null : <ExamLibrarySkeleton />;
  if (error && !data) {
    if (heading) return null;
    return (
      <Center py={64}>
        <Stack align="center" gap="sm">
          <Text c="red.6" fw={600}>
            {t.exam.loadListError}
          </Text>
          <Button
            variant="filled"
            color="navy.9"
            radius="xl"
            size="sm"
            onClick={() => void refetch().catch(() => undefined)}
          >
            {t.common.retry}
          </Button>
        </Stack>
      </Center>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const tests = (data?.fullTests ?? []).filter(
    (test) =>
      (!variant || test.certificateVariant === variant) &&
      (!query || test.title.toLowerCase().includes(query)),
  );
  const sittings = data?.myFullTestSittings ?? [];

  if (tests.length === 0) {
    if (heading) return null;
    return (
      <Center py={64}>
        <Text c="dimmed">
          {query
            ? tr(
                "Không có full test nào khớp với từ khoá này.",
                "No full test matches that search.",
              )
            : tr(
                "Chưa có full test nào được xuất bản.",
                "No full test has been published yet.",
              )}
        </Text>
      </Center>
    );
  }

  return (
    <Stack gap="md">
      {heading && (
        <Title order={2} size="h4" c="navy.9">
          {heading}
        </Title>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {tests.map((test) => (
          <FullTestCard
            key={test.id}
            test={test}
            sittings={sittings.filter(
              (sitting) => sitting.fullTestId === test.id,
            )}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
