import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View } from "react-native";

import { Avatar } from "@/features/shared/Avatar";
import { formatDateTime } from "@/features/shared/labels";
import type { BlogPostSummaryFieldsFragment } from "@/lib/graphql/generated";
import { AppText, Badge, Card, Row } from "@/ui/components";
import { colors, spacing } from "@/ui/theme";

export const POST_STATUS_LABELS: Record<
  string,
  { label: string; tone: "accent" | "danger" | "neutral" | "success" }
> = {
  PENDING: { label: "Chờ duyệt", tone: "accent" },
  REJECTED: { label: "Bị từ chối", tone: "danger" },
  HIDDEN: { label: "Đã ẩn", tone: "neutral" },
  DRAFT: { label: "Bản nháp", tone: "neutral" },
};

export function PostCard({ post }: { post: BlogPostSummaryFieldsFragment }) {
  const status = POST_STATUS_LABELS[post.status];
  return (
    <Card
      style={{ marginBottom: spacing.sm }}
      onPress={() =>
        router.push({
          pathname: "/blog/[postId]",
          params: { postId: post.id, saved: post.savedByMe ? "1" : "0" },
        })
      }
    >
      <Row style={{ marginBottom: spacing.sm }}>
        <Avatar
          url={post.author?.avatarUrl}
          name={post.author?.displayName}
          size={32}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="label">
            {post.author?.displayName ?? "Người dùng đã rời đi"}
          </AppText>
          <AppText variant="caption" tone="muted">
            {formatDateTime(post.createdAt)}
            {post.editedAt ? " · đã sửa" : ""}
          </AppText>
        </View>
        {status ? <Badge label={status.label} tone={status.tone} /> : null}
      </Row>
      <AppText variant="heading" numberOfLines={2}>
        {post.title}
      </AppText>
      {post.excerpt ? (
        <AppText tone="muted" numberOfLines={3}>
          {post.excerpt}
        </AppText>
      ) : null}
      {post.tags.length > 0 ? (
        <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
          {post.tags.slice(0, 4).map((tag) => (
            <Badge
              key={`${tag.kind}-${tag.value}`}
              label={`#${tag.value}`}
              tone="neutral"
            />
          ))}
        </Row>
      ) : null}
      <Row gap={spacing.lg} style={{ marginTop: spacing.sm }}>
        <Row gap={4}>
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            size={16}
            color={post.likedByMe ? colors.danger : colors.textMuted}
          />
          <AppText variant="caption" tone="muted">
            {post.likeCount}
          </AppText>
        </Row>
        <Row gap={4}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={colors.textMuted}
          />
          <AppText variant="caption" tone="muted">
            {post.commentCount}
          </AppText>
        </Row>
        {post.savedByMe ? (
          <Ionicons name="bookmark" size={16} color={colors.primary} />
        ) : null}
      </Row>
    </Card>
  );
}
