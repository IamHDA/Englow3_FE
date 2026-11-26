import { Stack } from "expo-router";
import { useState } from "react";

import { PostCard } from "@/features/blog/PostCard";
import { useSavedBlogPostsQuery } from "@/lib/graphql/generated";
import { EmptyState, Pager, Screen } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

export default function SavedBlogPostsScreen() {
  const [page, setPage] = useState(0);
  const saved = useSavedBlogPostsQuery({
    variables: { page, size: 10 },
    fetchPolicy: "cache-and-network",
  });
  return (
    <Screen
      refreshing={saved.loading && Boolean(saved.data)}
      onRefresh={() => void saved.refetch()}
    >
      <Stack.Screen options={{ title: "Bài đã lưu" }} />
      <QueryView
        loading={saved.loading}
        error={saved.error}
        data={saved.data?.savedBlogPosts}
        onRetry={() => void saved.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState icon="bookmark-outline" title="Bạn chưa lưu bài nào" />
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
    </Screen>
  );
}
