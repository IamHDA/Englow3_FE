"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useFullTestLibraryQuery } from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { STATUS_COPY } from "../../../constants/fullTest";
import { FullTestLibrarySkeleton } from "../../blocks/FullTestLibrarySkeleton";

/**
 * IELTS full tests: four skills sat as one test with one overall band. The
 * learner's own sittings come first, so an open one is easy to get back to.
 */
export function FullTestLibraryView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error, refetch } = useFullTestLibraryQuery({
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) return <FullTestLibrarySkeleton />;
  if (error && !data)
    return (
      <LoadErrorState
        error={error}
        thing={{ vi: "danh sách full test", en: "the full tests" }}
        back={{ href: "/exams", label: tr("Thư viện đề", "Exam library") }}
        onRetry={() => void refetch()}
      />
    );

  const tests = data?.fullTests ?? [];
  const sittings = data?.myFullTestSittings ?? [];

  return (
    <Page>
      <Stack gap="xl">
        <PageHeader
          title={tr("IELTS Full Test", "IELTS Full Tests")}
          actions={
            <Button component={Link} href="/exams" variant="default">
              {tr("Đề L+R riêng lẻ", "Single papers")}
            </Button>
          }
        />
        <Text c="dimmed" maw={720}>
          {tr(
            "Một full test gồm Listening, Reading, Writing và Speaking, cho một band tổng như thi thật. Bạn có 7 ngày để nộp đủ các phần.",
            "A full test covers Listening, Reading, Writing and Speaking and gives one overall band, as the real test does. You have seven days to hand in every part.",
          )}
        </Text>

        {sittings.length > 0 && (
          <Stack gap="sm">
            <Title order={2} size="h4">
              {tr("Lượt của bạn", "Your sittings")}
            </Title>
            {sittings.map((sitting) => {
              const status = STATUS_COPY[sitting.status];
              return (
                <Card key={sitting.id} withBorder radius="md" p="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2}>
                      <Text fw={600}>{sitting.title}</Text>
                      <Group gap="xs">
                        <Badge color={status.color} variant="light">
                          {isVi ? status.vi : status.en}
                        </Badge>
                        {(sitting.overallBand ?? sitting.provisionalBand) !==
                          null && (
                          <Text size="sm" c="dimmed">
                            Band{" "}
                            {(
                              sitting.overallBand ?? sitting.provisionalBand
                            )?.toFixed(1)}
                            {sitting.overallBand === null
                              ? tr(" (tạm)", " (provisional)")
                              : ""}
                          </Text>
                        )}
                      </Group>
                    </Stack>
                    <Button
                      component={Link}
                      href={`/exams/full-tests/sittings/${sitting.id}`}
                      variant="light"
                    >
                      {tr("Mở", "Open")}
                    </Button>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}

        <Stack gap="sm">
          <Title order={2} size="h4">
            {tr("Full test hiện có", "Available full tests")}
          </Title>
          {tests.length === 0 ? (
            <Card withBorder radius="md" p="lg">
              <Text c="dimmed">
                {tr(
                  "Chưa có full test nào được xuất bản.",
                  "No full test has been published yet.",
                )}
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {tests.map((test) => (
                <Card key={test.id} withBorder radius="lg" p="lg">
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                      <Text fw={700}>{test.title}</Text>
                      <Badge variant="light">{test.certificateVariant}</Badge>
                    </Group>
                    {test.description && (
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {test.description}
                      </Text>
                    )}
                    <Button
                      component={Link}
                      href={`/exams/full-tests/${test.id}`}
                      mt="sm"
                      w="fit-content"
                    >
                      {tr("Xem và bắt đầu", "View and start")}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Stack>
    </Page>
  );
}
