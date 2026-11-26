import { Stack, useLocalSearchParams } from "expo-router";

import { PostEditor } from "@/features/blog/PostEditor";
import { useBlogPostQuery } from "@/lib/graphql/generated";
import { EmptyState, Screen } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";

export default function EditBlogPostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const post = useBlogPostQuery({
    variables: { id: postId },
    fetchPolicy: "network-only",
  });
  return (
    <>
      <Stack.Screen options={{ title: "Sửa bài" }} />
      {post.data?.blogPost ? (
        post.data.blogPost.canEdit ? (
          <PostEditor
            initial={{
              id: post.data.blogPost.id,
              version: post.data.blogPost.version,
              title: post.data.blogPost.title,
              body: post.data.blogPost.body,
              tags: post.data.blogPost.tags.map((tag) => ({
                kind: tag.kind,
                value: tag.value,
              })),
            }}
          />
        ) : (
          <Screen>
            <EmptyState
              icon="lock-closed-outline"
              title="Bạn không sửa được bài này"
            />
          </Screen>
        )
      ) : (
        <Screen>
          <QueryView
            loading={post.loading}
            error={post.error}
            data={post.data?.blogPost}
            onRetry={() => void post.refetch()}
          >
            {() => null}
          </QueryView>
        </Screen>
      )}
    </>
  );
}
