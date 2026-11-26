import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { formatDuration } from "@/features/shared/labels";
import { CertificateType, useExamLibraryQuery } from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  ListItem,
  Pager,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function ExamLibraryScreen() {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [certificate, setCertificate] = useState<CertificateType | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const exams = useExamLibraryQuery({
    variables: {
      title: title || null,
      certificateType: certificate,
      page,
      size: 15,
    },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Screen
      refreshing={exams.loading && Boolean(exams.data)}
      onRefresh={() => void exams.refetch()}
    >
      <ListItem
        icon="trophy-outline"
        iconColor={colors.accent}
        title="IELTS Full Test"
        subtitle="Đủ 4 kỹ năng, chấm điểm band"
        onPress={() => router.push("/exams/full-tests")}
      />
      <ListItem
        icon="time-outline"
        title="Lịch sử làm đề"
        onPress={() => router.push("/exams/history")}
      />

      <Section title="Thư viện đề">
        <TextField
          placeholder="Tìm đề thi…"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Tìm đề thi"
        />
        <ChipRow>
          <Chip
            label="Tất cả"
            selected={certificate === null}
            onPress={() => {
              setCertificate(null);
              setPage(0);
            }}
          />
          {[CertificateType.IELTS, CertificateType.TOEIC].map((type) => (
            <Chip
              key={type}
              label={type}
              selected={certificate === type}
              onPress={() => {
                setCertificate(type);
                setPage(0);
              }}
            />
          ))}
        </ChipRow>
        <QueryView
          loading={exams.loading}
          error={exams.error}
          data={exams.data?.exams}
          onRetry={() => void exams.refetch()}
          isEmpty={(data) => data.items.length === 0}
          empty={
            <EmptyState
              icon="document-text-outline"
              title="Không có đề phù hợp"
            />
          }
        >
          {(data) => (
            <>
              {data.items.map((exam) => (
                <Card
                  key={exam.id}
                  style={{ marginBottom: spacing.sm }}
                  onPress={() =>
                    router.push({
                      pathname: "/exams/[id]",
                      params: { id: exam.id },
                    })
                  }
                >
                  <Row
                    style={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <AppText variant="label">{exam.title}</AppText>
                      <AppText variant="caption" tone="muted">
                        {[
                          exam.certificateType,
                          exam.certificateVariant,
                          `${exam.questionCount} câu`,
                          formatDuration(exam.durationSeconds),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </AppText>
                    </View>
                    {exam.bestScorePercentage != null ? (
                      <Badge
                        label={`${Math.round(exam.bestScorePercentage)}%`}
                        tone="success"
                      />
                    ) : exam.attemptStatus === "IN_PROGRESS" ? (
                      <Badge label="Đang làm" tone="accent" />
                    ) : exam.targetLevel ? (
                      <Badge label={exam.targetLevel} />
                    ) : null}
                  </Row>
                </Card>
              ))}
              <Pager
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
              />
            </>
          )}
        </QueryView>
      </Section>
    </Screen>
  );
}
