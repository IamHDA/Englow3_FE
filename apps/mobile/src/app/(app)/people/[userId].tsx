import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, View } from "react-native";

import { PostCard } from "@/features/blog/PostCard";
import { RelationshipButton } from "@/features/friends/RelationshipButton";
import { Avatar } from "@/features/shared/Avatar";
import { formatDate } from "@/features/shared/labels";
import { useUserWallQuery } from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  EmptyState,
  Pager,
  Row,
  Screen,
  Section,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, radius, spacing } from "@/ui/theme";

export default function UserWallScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [page, setPage] = useState(0);
  const wall = useUserWallQuery({
    variables: { userId, postsPage: page, postsSize: 10 },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Screen
      refreshing={wall.loading && Boolean(wall.data)}
      onRefresh={() => void wall.refetch()}
      padded={false}
    >
      <Stack.Screen
        options={{
          title: wall.data?.userWall.profile?.displayName ?? "Trang cá nhân",
        }}
      />
      <QueryView
        loading={wall.loading}
        error={wall.error}
        data={wall.data?.userWall}
        onRetry={() => void wall.refetch()}
      >
        {(data) =>
          !data.available || !data.profile ? (
            <EmptyState
              icon="person-remove-outline"
              title="Không xem được trang này"
              message="Người này không tồn tại hoặc không muốn hiển thị với bạn."
            />
          ) : (
            <>
              {data.profile.bannerUrl ? (
                <Image
                  source={{ uri: data.profile.bannerUrl }}
                  style={{ width: "100%", height: 140 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{ height: 100, backgroundColor: colors.primarySoft }}
                />
              )}
              <View style={{ padding: spacing.lg, marginTop: -40 }}>
                <View
                  style={{
                    borderRadius: radius.pill,
                    borderWidth: 3,
                    borderColor: colors.surface,
                    alignSelf: "flex-start",
                  }}
                >
                  <Avatar
                    url={data.profile.avatarUrl}
                    name={data.profile.displayName}
                    size={80}
                  />
                </View>
                <Row style={{ marginTop: spacing.sm }}>
                  <AppText variant="title">{data.profile.displayName}</AppText>
                  {data.profile.staff ? (
                    <Badge label="Đội ngũ Englow3" />
                  ) : null}
                </Row>
                <AppText tone="muted">
                  {data.friendCount} bạn bè · tham gia{" "}
                  {formatDate(data.profile.joinedAt)}
                </AppText>
                {data.relationship ? (
                  <View style={{ marginTop: spacing.md }}>
                    <RelationshipButton
                      userId={data.userId}
                      status={data.relationship.status}
                      requestId={data.relationship.requestId}
                      onChanged={() => void wall.refetch()}
                    />
                  </View>
                ) : null}

                <Section title="Bài viết">
                  {!data.posts || data.posts.items.length === 0 ? (
                    <Card>
                      <AppText tone="muted">Chưa có bài viết nào.</AppText>
                    </Card>
                  ) : (
                    <>
                      {data.posts.items.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      <Pager
                        page={data.posts.page}
                        totalPages={data.posts.totalPages}
                        onChange={setPage}
                      />
                    </>
                  )}
                </Section>
              </View>
            </>
          )
        }
      </QueryView>
    </Screen>
  );
}
