import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";

import { MarkdownBody } from "@/features/blog/MarkdownBody";
import { POST_STATUS_LABELS } from "@/features/blog/PostCard";
import { askReportReason } from "@/features/blog/report";
import { Avatar } from "@/features/shared/Avatar";
import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  useBlogCommentsQuery,
  useBlogPostQuery,
  useCreateBlogCommentMutation,
  useDeleteBlogCommentMutation,
  useDeleteBlogPostMutation,
  useLikeBlogPostMutation,
  useReportBlogCommentMutation,
  useReportBlogPostMutation,
  useSaveBlogPostMutation,
  useUnlikeBlogPostMutation,
  useUnsaveBlogPostMutation,
  useUpdateBlogCommentMutation,
  type BlogCommentFieldsFragment,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Notice,
  Pager,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors, spacing } from "@/ui/theme";

export default function BlogPostScreen() {
  // The list knows whether the post is saved; the post itself does not say.
  const { postId, saved: savedParam } = useLocalSearchParams<{
    postId: string;
    saved?: string;
  }>();
  const post = useBlogPostQuery({
    variables: { id: postId },
    fetchPolicy: "cache-and-network",
  });
  const [commentPage, setCommentPage] = useState(0);
  const comments = useBlogCommentsQuery({
    variables: { postId, page: commentPage, size: 20 },
    fetchPolicy: "cache-and-network",
  });
  const [like] = useLikeBlogPostMutation();
  const [unlike] = useUnlikeBlogPostMutation();
  const [save] = useSaveBlogPostMutation();
  const [unsave] = useUnsaveBlogPostMutation();
  const [reportPost] = useReportBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();
  const [createComment, createState] = useCreateBlogCommentMutation();
  const [saved, setSaved] = useState(savedParam === "1");
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const fail = (failure: unknown) => setNotice(errorMessage(failure));

  return (
    <Screen
      refreshing={post.loading && Boolean(post.data)}
      onRefresh={() => {
        void post.refetch();
        void comments.refetch();
      }}
    >
      <QueryView
        loading={post.loading}
        error={post.error}
        data={post.data?.blogPost}
        onRetry={() => void post.refetch()}
      >
        {(item) => {
          const status = POST_STATUS_LABELS[item.status];
          return (
            <>
              <Stack.Screen
                options={{
                  title: "Bài viết",
                  headerRight: () => (
                    <Pressable
                      hitSlop={8}
                      accessibilityLabel="Tuỳ chọn bài viết"
                      onPress={() =>
                        Alert.alert("Bài viết", undefined, [
                          ...(item.canEdit
                            ? [
                                {
                                  text: "Sửa bài",
                                  onPress: () =>
                                    router.push({
                                      pathname: "/blog/[postId]/edit",
                                      params: { postId },
                                    }),
                                },
                                {
                                  text: "Xoá bài",
                                  style: "destructive" as const,
                                  onPress: () =>
                                    Alert.alert(
                                      "Xoá bài viết?",
                                      "Không khôi phục được sau khi xoá.",
                                      [
                                        { text: "Huỷ", style: "cancel" },
                                        {
                                          text: "Xoá",
                                          style: "destructive",
                                          onPress: () =>
                                            void deletePost({
                                              variables: { id: postId },
                                            })
                                              .then(() => router.back())
                                              .catch(fail),
                                        },
                                      ],
                                    ),
                                },
                              ]
                            : [
                                {
                                  text: "Báo cáo",
                                  style: "destructive" as const,
                                  onPress: () =>
                                    askReportReason(
                                      (reason) =>
                                        void reportPost({
                                          variables: { id: postId, reason },
                                        })
                                          .then(() =>
                                            setNotice(
                                              "Đã gửi báo cáo. Cảm ơn bạn.",
                                            ),
                                          )
                                          .catch(fail),
                                    ),
                                },
                              ]),
                          { text: "Đóng", style: "cancel" },
                        ])
                      }
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={22}
                        color={colors.primary}
                      />
                    </Pressable>
                  ),
                }}
              />
              <Notice
                message={notice}
                tone={notice?.startsWith("Đã") ? "success" : "danger"}
              />
              <Row style={{ marginBottom: spacing.md }}>
                <Pressable
                  onPress={() =>
                    item.author &&
                    router.push({
                      pathname: "/people/[userId]",
                      params: { userId: item.author.userId },
                    })
                  }
                >
                  <Avatar
                    url={item.author?.avatarUrl}
                    name={item.author?.displayName}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <AppText variant="label">
                    {item.author?.displayName ?? "Người dùng đã rời đi"}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {formatDateTime(item.createdAt)}
                    {item.editedAt ? " · đã sửa" : ""}
                  </AppText>
                </View>
                {status ? (
                  <Badge label={status.label} tone={status.tone} />
                ) : null}
              </Row>
              {item.moderationNote ? (
                <Notice
                  tone="info"
                  message={`Ghi chú kiểm duyệt: ${item.moderationNote}`}
                />
              ) : null}
              <AppText variant="title" style={{ marginBottom: spacing.sm }}>
                {item.title}
              </AppText>
              {item.tags.length > 0 ? (
                <Row wrap gap={spacing.xs} style={{ marginBottom: spacing.md }}>
                  {item.tags.map((tag) => (
                    <Badge
                      key={`${tag.kind}-${tag.value}`}
                      label={`#${tag.value}`}
                      tone="neutral"
                    />
                  ))}
                </Row>
              ) : null}
              <MarkdownBody body={item.body} images={item.images} />

              {item.canInteract ? (
                <Row gap={spacing.sm} style={{ marginVertical: spacing.lg }}>
                  <Button
                    title={`${item.likeCount}`}
                    icon={item.likedByMe ? "heart" : "heart-outline"}
                    variant={item.likedByMe ? "danger" : "secondary"}
                    size="sm"
                    onPress={() =>
                      void (
                        item.likedByMe
                          ? unlike({ variables: { id: postId } })
                          : like({ variables: { id: postId } })
                      )
                        .then(() => post.refetch())
                        .catch(fail)
                    }
                  />
                  <Button
                    title={saved ? "Đã lưu" : "Lưu"}
                    icon={saved ? "bookmark" : "bookmark-outline"}
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      void (
                        saved
                          ? unsave({ variables: { id: postId } })
                          : save({ variables: { id: postId } })
                      )
                        .then(({ data }) => {
                          const result =
                            data &&
                            ("saveBlogPost" in data
                              ? data.saveBlogPost
                              : data.unsaveBlogPost);
                          if (result) setSaved(result.saved);
                        })
                        .catch(fail)
                    }
                  />
                </Row>
              ) : null}

              <Section title={`Bình luận (${item.commentCount})`}>
                {item.canInteract ? (
                  <>
                    <TextField
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Viết bình luận…"
                      multiline
                      accessibilityLabel="Bình luận"
                    />
                    <Button
                      title="Gửi bình luận"
                      size="sm"
                      loading={createState.loading}
                      disabled={!comment.trim()}
                      onPress={() =>
                        void createComment({
                          variables: { postId, body: comment.trim() },
                        })
                          .then(() => {
                            setComment("");
                            void comments.refetch();
                            void post.refetch();
                          })
                          .catch(fail)
                      }
                      style={{
                        alignSelf: "flex-end",
                        marginBottom: spacing.md,
                      }}
                    />
                  </>
                ) : null}
                {comments.data?.blogComments.items.map((entry) => (
                  <CommentRow
                    key={entry.id}
                    comment={entry}
                    onChanged={() => void comments.refetch()}
                    onError={fail}
                  />
                ))}
                {comments.data ? (
                  <Pager
                    page={comments.data.blogComments.page}
                    totalPages={comments.data.blogComments.totalPages}
                    onChange={setCommentPage}
                  />
                ) : null}
              </Section>
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}

function CommentRow({
  comment,
  onChanged,
  onError,
}: {
  comment: BlogCommentFieldsFragment;
  onChanged: () => void;
  onError: (failure: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [update, updateState] = useUpdateBlogCommentMutation();
  const [remove] = useDeleteBlogCommentMutation();
  const [report] = useReportBlogCommentMutation();

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <Row>
        <Avatar
          url={comment.author?.avatarUrl}
          name={comment.author?.displayName}
          size={28}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="label">
            {comment.author?.displayName ?? "Người dùng"}
          </AppText>
          <AppText variant="caption" tone="muted">
            {formatDateTime(comment.createdAt)}
            {comment.editedAt ? " · đã sửa" : ""}
          </AppText>
        </View>
        <Pressable
          hitSlop={8}
          accessibilityLabel="Tuỳ chọn bình luận"
          onPress={() =>
            Alert.alert("Bình luận", undefined, [
              ...(comment.canEdit
                ? [
                    { text: "Sửa", onPress: () => setEditing(true) },
                    {
                      text: "Xoá",
                      style: "destructive" as const,
                      onPress: () =>
                        void remove({ variables: { id: comment.id } })
                          .then(onChanged)
                          .catch(onError),
                    },
                  ]
                : [
                    {
                      text: "Báo cáo",
                      style: "destructive" as const,
                      onPress: () =>
                        askReportReason(
                          (reason) =>
                            void report({
                              variables: { id: comment.id, reason },
                            }).catch(onError),
                        ),
                    },
                  ]),
              { text: "Đóng", style: "cancel" },
            ])
          }
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      </Row>
      {editing ? (
        <>
          <TextField
            value={body}
            onChangeText={setBody}
            multiline
            accessibilityLabel="Sửa bình luận"
          />
          <Row gap={spacing.sm}>
            <Button
              title="Lưu"
              size="sm"
              loading={updateState.loading}
              disabled={!body.trim()}
              onPress={() =>
                void update({
                  variables: { id: comment.id, body: body.trim() },
                })
                  .then(() => {
                    setEditing(false);
                    onChanged();
                  })
                  .catch(onError)
              }
            />
            <Button
              title="Huỷ"
              size="sm"
              variant="ghost"
              onPress={() => setEditing(false)}
            />
          </Row>
        </>
      ) : (
        <AppText style={{ marginTop: spacing.xs }} selectable>
          {comment.body}
        </AppText>
      )}
    </Card>
  );
}
