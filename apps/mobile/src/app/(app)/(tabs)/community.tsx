import { router } from "expo-router";
import { useEffect, useState } from "react";

import { PostCard } from "@/features/blog/PostCard";
import {
  BlogPostSort,
  useBlogPostsQuery,
  useBlogTagCatalogueQuery,
  useChatUnreadCountQuery,
  useIncomingFriendRequestCountQuery,
} from "@/lib/graphql/generated";
import {
  Badge,
  Button,
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
import { spacing } from "@/ui/theme";

export default function CommunityScreen() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<BlogPostSort>(BlogPostSort.NEWEST);
  const [skill, setSkill] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const unread = useChatUnreadCountQuery({ fetchPolicy: "cache-and-network" });
  const requests = useIncomingFriendRequestCountQuery({
    fetchPolicy: "cache-and-network",
  });
  const catalogue = useBlogTagCatalogueQuery();
  const posts = useBlogPostsQuery({
    variables: { q: q || null, sort, skill, page, size: 10 },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(search.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const unreadCount = unread.data?.chatUnreadCount ?? 0;
  const requestCount = requests.data?.incomingFriendRequestCount ?? 0;

  return (
    <Screen
      refreshing={posts.loading && Boolean(posts.data)}
      onRefresh={() => {
        void posts.refetch();
        void unread.refetch();
        void requests.refetch();
      }}
    >
      <ListItem
        icon="chatbubbles-outline"
        title="Tin nhắn"
        right={
          unreadCount > 0 ? (
            <Badge label={String(unreadCount)} tone="accent" />
          ) : undefined
        }
        onPress={() => router.push("/chat")}
      />
      <ListItem
        icon="people-outline"
        title="Bạn bè"
        subtitle={
          requestCount > 0 ? `${requestCount} lời mời kết bạn` : undefined
        }
        right={
          requestCount > 0 ? (
            <Badge label={String(requestCount)} tone="accent" />
          ) : undefined
        }
        onPress={() => router.push("/friends")}
      />

      <Section
        title="Blog cộng đồng"
        action={
          <Button
            title="Viết bài"
            icon="create-outline"
            size="sm"
            onPress={() => router.push("/blog/new")}
          />
        }
      >
        <TextField
          placeholder="Tìm bài viết…"
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Tìm bài viết"
        />
        <ChipRow>
          <Chip
            label="Mới nhất"
            selected={sort === BlogPostSort.NEWEST}
            onPress={() => {
              setSort(BlogPostSort.NEWEST);
              setPage(0);
            }}
          />
          <Chip
            label="Nhiều thích"
            selected={sort === BlogPostSort.MOST_LIKED}
            onPress={() => {
              setSort(BlogPostSort.MOST_LIKED);
              setPage(0);
            }}
          />
          {(catalogue.data?.blogTagCatalogue.skills ?? []).map((item) => (
            <Chip
              key={item}
              label={`#${item}`}
              selected={skill === item}
              onPress={() => {
                setSkill(skill === item ? null : item);
                setPage(0);
              }}
            />
          ))}
        </ChipRow>
        <Row gap={spacing.sm} style={{ marginBottom: spacing.sm }}>
          <Button
            title="Bài đã lưu"
            variant="ghost"
            size="sm"
            icon="bookmark-outline"
            onPress={() => router.push("/blog/saved")}
          />
        </Row>
        <QueryView
          loading={posts.loading}
          error={posts.error}
          data={posts.data?.blogPosts}
          onRetry={() => void posts.refetch()}
          isEmpty={(data) => data.items.length === 0}
          empty={
            <EmptyState
              icon="newspaper-outline"
              title="Chưa có bài viết phù hợp"
            />
          }
        >
          {(data) => (
            <>
              {data.items.map((post) => (
                <PostCard key={post.id} post={post} />
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
