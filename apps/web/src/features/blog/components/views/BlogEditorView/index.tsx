"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useBlogPostQuery,
  useBlogTagCatalogueQuery,
  useCreateBlogPostMutation,
  useStartBlogImageUploadMutation,
  useUpdateBlogPostMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import { useBlogImageUpload } from "../../../hooks/useBlogImageUpload";
import type { PostFormValues } from "../../../schemas/post";
import type { BlogPostData } from "../../../types";
import { PostEditorForm } from "../../blocks/PostEditorForm";
import { PostEditorFormSkeleton } from "../../blocks/PostEditorForm/PostEditorFormSkeleton";
import { BlogEmptyState } from "../../parts/BlogEmptyState";

const EMPTY_POST = { title: "", body: "", tags: [] };

/**
 * /blog/new and /blog/[postId]/edit: write a post, or change one. Which of the
 * two is whether a post id is given. To edit, the post is read first and the
 * save sends the `version` it had then, so a post a moderator hid or the author
 * changed elsewhere is refused (BLOG_POST_STALE) rather than overwritten; and a
 * post the backend says cannot be edited (`canEdit` false: not the author's, or
 * hidden or removed) gets a page that says so instead of a form.
 *
 * The tag words come from the backend's catalogue. If they cannot be loaded the
 * form still works - a post is saved with the tags it has.
 */
export function BlogEditorView({ postId }: { postId?: string }) {
  const { t } = useLanguage();
  const copy = t.blog;
  const router = useRouter();
  const editing = postId !== undefined;
  // Bumped to build the form again from a post fetched anew.
  const [round, setRound] = useState(0);
  // The post as the editor opened it, kept: what is being edited, and the
  // `version` the save sends, are that one. A newer answer arriving meanwhile
  // (a moderator hid it, the author saved elsewhere) is not allowed to swap the
  // text under the cursor or to hand a save a version it never saw - that is
  // what BLOG_POST_STALE is for.
  const [opened, setOpened] = useState<BlogPostData | null>(null);

  const catalogue = useBlogTagCatalogueQuery({ fetchPolicy: "cache-first" });
  const existing = useBlogPostQuery({
    variables: { id: postId ?? "" },
    skip: !editing,
    // Not the cache: the version to be saved against is the server's.
    fetchPolicy: "network-only",
  });
  const answered = existing.data?.blogPost ?? null;
  if (answered && opened === null) setOpened(answered);

  const [createPost] = useCreateBlogPostMutation();
  const [updatePost] = useUpdateBlogPostMutation();
  const [startImageUpload] = useStartBlogImageUploadMutation();
  const { validate, upload } = useBlogImageUpload({
    startUpload: async (variables) => {
      const { data } = await startImageUpload({ variables });
      if (!data) throw new Error("The BFF answered with no upload");
      return data.startBlogImageUpload;
    },
  });

  const back = { href: BLOG_ROUTES.list, label: copy.backToList };
  const post = opened;

  if (editing && !post) {
    return existing.error ? (
      <LoadErrorState
        error={existing.error}
        thing={copy.thing}
        back={back}
        notFoundDescription={copy.notFoundDescription}
        onRetry={() => void existing.refetch().catch(() => undefined)}
      />
    ) : (
      <>
        <PageHeader title={copy.editor.titleEdit} />
        <PostEditorFormSkeleton />
      </>
    );
  }

  if (editing && post && !post.canEdit) {
    return (
      <BlogEmptyState
        icon={<Lock size={24} aria-hidden="true" />}
        title={copy.editor.cannotEditTitle}
        description={copy.editor.cannotEditDescription}
        action={
          <Button
            component={Link}
            href={BLOG_ROUTES.post(post.id)}
            variant="default"
            leftSection={<ArrowLeft size={16} aria-hidden="true" />}
          >
            {copy.backToList}
          </Button>
        }
      />
    );
  }

  async function save(values: PostFormValues) {
    const saved = post
      ? (
          await updatePost({
            variables: { id: post.id, input: values, version: post.version },
          })
        ).data?.updateBlogPost
      : (await createPost({ variables: { input: values } })).data
          ?.createBlogPost;
    if (!saved) throw new Error("The BFF answered with no post");
    notifications.show({
      color: "teal",
      message: post ? copy.editor.savedEdit : copy.editor.savedNew,
    });
    router.push(BLOG_ROUTES.post(saved.id));
  }

  return (
    <>
      <PageHeader
        title={editing ? copy.editor.titleEdit : copy.editor.titleNew}
      />
      <PostEditorForm
        key={round}
        mode={editing ? "update" : "create"}
        initial={
          post
            ? { title: post.title, body: post.body, tags: post.tags }
            : EMPTY_POST
        }
        savedImages={post?.images ?? []}
        catalogue={catalogue.data?.blogTagCatalogue ?? null}
        validateImage={validate}
        uploadImage={upload}
        onSave={save}
        onCancel={() =>
          router.push(post ? BLOG_ROUTES.post(post.id) : BLOG_ROUTES.list)
        }
        onReload={() =>
          void existing
            .refetch()
            .then((result) => {
              if (!result.data) return;
              setOpened(result.data.blogPost);
              setRound((current) => current + 1);
            })
            .catch(() => undefined)
        }
      />
    </>
  );
}
