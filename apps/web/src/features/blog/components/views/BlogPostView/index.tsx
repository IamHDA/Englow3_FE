"use client";

import { Button, Divider, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useBlogErrorMessage } from "../../../hooks/useBlogErrorMessage";
import {
  useBlogPostQuery,
  useDeleteBlogPostMutation,
  useReportBlogPostMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import { useBlogLike } from "../../../hooks/useBlogLike";
import { ownershipOf, useBlogViewer } from "../../../hooks/useBlogViewer";
import { PostArticle } from "../../blocks/PostArticle";
import { PostArticleSkeleton } from "../../blocks/PostArticle/PostArticleSkeleton";
import { ReportDialog } from "../../blocks/ReportDialog";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

import { CommentsSection } from "./CommentsSection";

/**
 * /blog/[postId]: one post, read - the text with its images, the likes, and the
 * comments under it. A post that is not there, is hidden from the viewer or is
 * by someone they have a block with is the same "not found" page: nothing says
 * which. The author who opens their own hidden or removed post sees why, and can
 * still delete it; the likes and comments are shut for it (`canInteract`).
 */
export function BlogPostView({ postId }: { postId: string }) {
  const { t } = useLanguage();
  const copy = t.blog;
  const router = useRouter();
  const messageFor = useBlogErrorMessage();
  const viewer = useBlogViewer();

  const { data, error, refetch } = useBlogPostQuery({
    variables: { id: postId },
    fetchPolicy: "cache-and-network",
  });
  const like = useBlogLike({
    onError: (failure) =>
      notifications.show({
        color: "warn",
        title: copy.actionErrorTitle,
        message: messageFor(failure),
      }),
  });
  const [deletePost, deletion] = useDeleteBlogPostMutation();
  const [reportPost] = useReportBlogPostMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reporting, setReporting] = useState(false);

  const post = data?.blogPost;
  const back = { href: BLOG_ROUTES.list, label: copy.backToList };

  if (!post) {
    return error ? (
      <LoadErrorState
        error={error}
        thing={copy.thing}
        back={back}
        notFoundDescription={copy.notFoundDescription}
        onRetry={() => void refetch().catch(() => undefined)}
      />
    ) : (
      <PostArticleSkeleton />
    );
  }

  const ownership = ownershipOf(viewer, post.author?.userId);

  async function remove() {
    try {
      await deletePost({
        variables: { id: postId },
        update: (cache) => {
          for (const __typename of ["BlogPost", "BlogPostSummary"]) {
            cache.evict({ id: cache.identify({ __typename, id: postId }) });
          }
          cache.gc();
        },
        refetchQueries: ["BlogPosts", "UserWall"],
      });
      notifications.show({ color: "teal", message: copy.post.deleted });
      router.push(BLOG_ROUTES.list);
    } catch (failure) {
      setConfirmingDelete(false);
      notifications.show({
        color: "warn",
        title: copy.actionErrorTitle,
        message: messageFor(failure),
      });
    }
  }

  return (
    <Stack gap="xl">
      <Button
        component={Link}
        href={BLOG_ROUTES.list}
        variant="subtle"
        color="ink"
        size="compact-md"
        w="fit-content"
        leftSection={<ArrowLeft size={16} aria-hidden="true" />}
      >
        {copy.backToList}
      </Button>

      {/* Without the viewer's own account, what is theirs cannot be told: the controls that depend on it stay out, and this says so. */}
      {viewer.status === "failed" && (
        <BlogLoadError
          title={copy.viewer.errorTitle}
          description={copy.viewer.errorDescription}
          retryLabel={copy.viewer.retry}
          onRetry={viewer.retry}
        />
      )}

      <PostArticle
        post={post}
        ownership={ownership}
        likePending={like.pendingId === post.id}
        onToggleLike={() => void like.toggle(post)}
        onReport={() => setReporting(true)}
        onDelete={() => setConfirmingDelete(true)}
      />

      {/* A hidden or removed post takes no comments, and its author has no use for the box; the list stays for the ones they wrote. */}
      <Divider />
      <CommentsSection
        postId={post.id}
        viewer={viewer}
        canInteract={post.canInteract}
      />

      <ConfirmModal
        opened={confirmingDelete}
        title={copy.post.confirmDelete.title}
        body={copy.post.confirmDelete.body}
        confirmLabel={copy.post.confirmDelete.confirmLabel}
        cancelLabel={copy.post.confirmDelete.cancelLabel}
        danger
        loading={deletion.loading}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ReportDialog
        opened={reporting}
        target="post"
        onSubmit={async ({ reason, detail }) => {
          await reportPost({ variables: { id: postId, reason, detail } });
          notifications.show({
            color: "teal",
            title: copy.report.thanksTitle,
            message: copy.report.thanks,
          });
        }}
        onClose={() => setReporting(false)}
      />
    </Stack>
  );
}
