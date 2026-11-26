import { Stack } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  BlogModerationAction,
  BlogQueueSort,
  BlogTargetType,
  useAdminBlogQueueQuery,
  useAdminModerateBlogMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Notice,
  Pager,
  Row,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

const ACTIONS: {
  action: BlogModerationAction;
  label: string;
  variant: "danger" | "secondary" | "ghost";
}[] = [
  { action: BlogModerationAction.HIDE, label: "Ẩn", variant: "secondary" },
  { action: BlogModerationAction.REMOVE, label: "Gỡ", variant: "danger" },
  {
    action: BlogModerationAction.DISMISS,
    label: "Bỏ qua báo cáo",
    variant: "ghost",
  },
  {
    action: BlogModerationAction.RESTORE,
    label: "Khôi phục",
    variant: "ghost",
  },
];

export default function AdminBlogQueueScreen() {
  const [type, setType] = useState<BlogTargetType | null>(null);
  const [sort, setSort] = useState<BlogQueueSort>(BlogQueueSort.MOST_REPORTED);
  const [page, setPage] = useState(0);
  const queue = useAdminBlogQueueQuery({
    variables: { type, sort, page, size: 15 },
    fetchPolicy: "cache-and-network",
  });
  const [moderate] = useAdminModerateBlogMutation();
  const [error, setError] = useState<string | null>(null);
  const prompt = usePrompt();

  async function act(
    targetType: BlogTargetType,
    id: string,
    action: BlogModerationAction,
    label: string,
  ) {
    const reason = await prompt.ask({
      title: label,
      message: "Lý do được ghi vào nhật ký kiểm duyệt và gửi cho tác giả.",
      placeholder: "Lý do",
      confirmLabel: label,
      multiline: true,
    });
    if (!reason) return;
    try {
      await moderate({ variables: { type: targetType, id, action, reason } });
      void queue.refetch();
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }

  return (
    <Screen
      refreshing={queue.loading && Boolean(queue.data)}
      onRefresh={() => void queue.refetch()}
    >
      {prompt.element}
      <Stack.Screen options={{ title: "Kiểm duyệt blog" }} />
      <Notice message={error} />
      <ChipRow>
        <Chip
          label="Tất cả"
          selected={type === null}
          onPress={() => setType(null)}
        />
        <Chip
          label="Bài viết"
          selected={type === BlogTargetType.POST}
          onPress={() => setType(BlogTargetType.POST)}
        />
        <Chip
          label="Bình luận"
          selected={type === BlogTargetType.COMMENT}
          onPress={() => setType(BlogTargetType.COMMENT)}
        />
        <Chip
          label="Nhiều báo cáo"
          selected={sort === BlogQueueSort.MOST_REPORTED}
          onPress={() => setSort(BlogQueueSort.MOST_REPORTED)}
        />
        <Chip
          label="Cũ nhất"
          selected={sort === BlogQueueSort.OLDEST}
          onPress={() => setSort(BlogQueueSort.OLDEST)}
        />
      </ChipRow>
      <QueryView
        loading={queue.loading}
        error={queue.error}
        data={queue.data?.adminBlogQueue}
        onRetry={() => void queue.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="shield-checkmark-outline"
            title="Không có nội dung bị báo cáo"
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((item) => (
              <Card
                key={`${item.targetType}-${item.targetId}`}
                style={{ marginBottom: spacing.sm }}
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <Badge
                    label={
                      item.targetType === BlogTargetType.POST
                        ? "Bài viết"
                        : "Bình luận"
                    }
                    tone="neutral"
                  />
                  <Badge label={`${item.openReports} báo cáo`} tone="danger" />
                </Row>
                {item.title ? (
                  <AppText variant="label">{item.title}</AppText>
                ) : null}
                <AppText tone="muted" numberOfLines={4}>
                  {item.excerpt}
                </AppText>
                <AppText
                  variant="caption"
                  tone="muted"
                  style={{ marginTop: spacing.xs }}
                >
                  {item.author?.displayName ?? "?"} · {item.reasons.join(", ")}{" "}
                  · {formatDateTime(item.lastReportedAt)} · {item.targetStatus}
                </AppText>
                <View style={{ marginTop: spacing.sm }}>
                  <Row wrap gap={spacing.xs}>
                    {ACTIONS.map((entry) => (
                      <Button
                        key={entry.action}
                        title={entry.label}
                        size="sm"
                        variant={entry.variant}
                        onPress={() =>
                          entry.action === BlogModerationAction.REMOVE
                            ? Alert.alert(
                                "Gỡ nội dung?",
                                "Nội dung bị gỡ sẽ không hiển thị với ai nữa.",
                                [
                                  { text: "Huỷ", style: "cancel" },
                                  {
                                    text: "Tiếp tục",
                                    style: "destructive",
                                    onPress: () =>
                                      void act(
                                        item.targetType,
                                        item.targetId,
                                        entry.action,
                                        entry.label,
                                      ),
                                  },
                                ],
                              )
                            : void act(
                                item.targetType,
                                item.targetId,
                                entry.action,
                                entry.label,
                              )
                        }
                      />
                    ))}
                  </Row>
                </View>
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
    </Screen>
  );
}
