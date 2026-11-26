import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";

import { formatDateTime } from "@/features/shared/labels";
import {
  useTutorHistoryQuery,
  useTutorUsageQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  ListItem,
  Pager,
  ProgressBar,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

export default function TutorHomeScreen() {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(0);
  const usage = useTutorUsageQuery({ fetchPolicy: "cache-and-network" });
  const history = useTutorHistoryQuery({
    variables: { page, size: 20, search: term || null, archived },
    fetchPolicy: "cache-and-network",
  });
  const quota = usage.data?.tutorUsage;

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Screen
      refreshing={history.loading && Boolean(history.data)}
      onRefresh={() => {
        void history.refetch();
        void usage.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Gia sư AI" }} />
      {quota ? (
        <Card style={{ marginBottom: spacing.lg }}>
          {quota.enabled ? (
            <>
              <AppText variant="label">
                Còn {quota.remaining}/{quota.limit} tin nhắn
              </AppText>
              <ProgressBar
                value={quota.limit > 0 ? quota.used / quota.limit : 0}
              />
              {quota.resetsAt ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  Làm mới lúc {formatDateTime(quota.resetsAt)}
                </AppText>
              ) : null}
            </>
          ) : (
            <AppText tone="muted">
              Gia sư AI đang tạm tắt. Bạn vẫn xem lại được các cuộc trò chuyện
              cũ.
            </AppText>
          )}
        </Card>
      ) : null}
      <Button
        title="Cuộc trò chuyện mới"
        icon="add"
        disabled={quota ? !quota.enabled || quota.remaining <= 0 : false}
        onPress={() =>
          router.push({ pathname: "/ai-tutor/[id]", params: { id: "new" } })
        }
      />
      <TextField
        placeholder="Tìm cuộc trò chuyện…"
        value={search}
        onChangeText={setSearch}
        style={{ marginTop: spacing.md }}
        accessibilityLabel="Tìm cuộc trò chuyện"
      />
      <ChipRow>
        <Chip
          label="Đang dùng"
          selected={!archived}
          onPress={() => {
            setArchived(false);
            setPage(0);
          }}
        />
        <Chip
          label="Đã lưu trữ"
          selected={archived}
          onPress={() => {
            setArchived(true);
            setPage(0);
          }}
        />
      </ChipRow>
      <QueryView
        loading={history.loading}
        error={history.error}
        data={history.data?.tutorHistory}
        onRetry={() => void history.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="sparkles-outline"
            title="Chưa có cuộc trò chuyện nào"
            message="Hỏi gia sư về ngữ pháp, từ vựng hoặc luyện hội thoại."
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((conversation) => (
              <ListItem
                key={conversation.id}
                icon="chatbubbles-outline"
                title={conversation.title || "Cuộc trò chuyện"}
                subtitle={`${conversation.messageCount} tin nhắn · ${formatDateTime(conversation.lastMessageAt ?? conversation.createdAt)}`}
                onPress={() =>
                  router.push({
                    pathname: "/ai-tutor/[id]",
                    params: { id: conversation.id },
                  })
                }
              />
            ))}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </QueryView>
    </Screen>
  );
}
