"use client";

import { Box, Flex, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import {
  useBlogCommentsQuery,
  useCreateBlogCommentMutation,
  useDeleteBlogCommentMutation,
  useReportBlogCommentMutation,
  useUpdateBlogCommentMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { COMMENTS_PAGE_SIZE } from "../../../../constants/blog";
import { useBlogErrorMessage } from "../../../../hooks/useBlogErrorMessage";
import { CommentForm } from "../../../blocks/CommentForm";
import { CommentList } from "../../../blocks/CommentList";
import { CommentListSkeleton } from "../../../blocks/CommentList/CommentListSkeleton";
import { ReportDialog } from "../../../blocks/ReportDialog";
import { BlogEmptyState } from "../../../parts/BlogEmptyState";
import { BlogLoadError } from "../../../parts/BlogLoadError";
import { BlogPagination } from "../../../parts/BlogPagination";
import { ConfirmModal } from "../../../parts/ConfirmModal";

type CommentsSectionProps = {
  postId: string;
  /** The id the backend knows the viewer by, to tell their own comments. */
  viewerId: string | null;
  /** From the post: when false the box and the Report links are not offered. */
  canInteract: boolean;
};

/**
 * The comments of a post: a page of them, oldest first, the box to write one,
 * and what can be done to each. The viewer's own hidden or removed comments are
 * in the list with their status (the backend sends them to their author only).
 * Writing or deleting one refreshes the post as well, which holds the count.
 */
export function CommentsSection({
  postId,
  viewerId,
  canInteract,
}: CommentsSectionProps) {
  const { t } = useLanguage();
  const copy = t.blog.comments;
  const messageFor = useBlogErrorMessage();
  const [page, setPage] = useState(1);
  const { data, previousData, loading, error, refetch } = useBlogCommentsQuery({
    variables: { postId, page: page - 1, size: COMMENTS_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const comments = (data ?? previousData)?.blogComments;

  const [createComment] = useCreateBlogCommentMutation();
  const [updateComment] = useUpdateBlogCommentMutation();
  const [deleteComment, deletion] = useDeleteBlogCommentMutation();
  const [reportComment] = useReportBlogCommentMutation();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reporting, setReporting] = useState<string | null>(null);

  async function write(body: string) {
    await createComment({
      variables: { postId, body },
      // The new comment is last, and the post's count went up by one.
      refetchQueries: ["BlogPost"],
      awaitRefetchQueries: true,
    });
    // Show it: the page it lands on is the last, which may be a new one.
    const total = (comments?.totalItems ?? 0) + 1;
    const last = Math.max(1, Math.ceil(total / COMMENTS_PAGE_SIZE));
    if (last !== page) setPage(last);
    else await refetch().catch(() => undefined);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteComment({
        variables: { id: deleting },
        refetchQueries: ["BlogPost", "BlogComments"],
        awaitRefetchQueries: true,
      });
      notifications.show({ color: "teal", message: copy.deleted });
    } catch (failure) {
      notifications.show({
        color: "warn",
        title: t.blog.actionErrorTitle,
        message: messageFor(failure),
      });
    } finally {
      setDeleting(null);
    }
  }

  let body;
  if (comments && comments.items.length > 0) {
    body = (
      <Stack gap="md">
        <CommentList
          comments={comments.items}
          viewerId={viewerId}
          canInteract={canInteract}
          onEdit={async (id, text) => {
            await updateComment({ variables: { id, body: text } });
          }}
          onDelete={setDeleting}
          onReport={setReporting}
        />
        <BlogPagination
          page={page}
          totalPages={comments.totalPages}
          onChange={setPage}
        />
      </Stack>
    );
  } else if (comments) {
    body = (
      <BlogEmptyState
        icon={<MessageCircle size={24} aria-hidden="true" />}
        title={copy.empty}
        description=""
      />
    );
  } else if (error) {
    body = (
      <BlogLoadError
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        retryLabel={copy.retry}
        onRetry={() => void refetch().catch(() => undefined)}
      />
    );
  } else {
    body = <CommentListSkeleton />;
  }

  return (
    <Flex
      component="section"
      direction="column"
      gap="md"
      aria-labelledby="blog-comments-title"
    >
      <Title order={2} fz={20} c="navy.9" id="blog-comments-title">
        {copy.title}
        {comments ? ` (${comments.totalItems})` : ""}
      </Title>

      {canInteract && (
        <CommentForm submitLabel={copy.form.submit} onSubmit={write} />
      )}

      <Box aria-busy={loading && !!comments}>{body}</Box>

      <ConfirmModal
        opened={deleting !== null}
        title={copy.confirmDelete.title}
        body={copy.confirmDelete.body}
        confirmLabel={copy.confirmDelete.confirmLabel}
        cancelLabel={copy.confirmDelete.cancelLabel}
        danger
        loading={deletion.loading}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
      <ReportDialog
        opened={reporting !== null}
        target="comment"
        onSubmit={async ({ reason, detail }) => {
          if (!reporting) return;
          await reportComment({ variables: { id: reporting, reason, detail } });
          notifications.show({
            color: "teal",
            title: t.blog.report.thanksTitle,
            message: t.blog.report.thanks,
          });
        }}
        onClose={() => setReporting(null)}
      />
    </Flex>
  );
}
