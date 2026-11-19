import type { Metadata } from "next";

import { BlogEditorView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Sửa bài viết | Englow3",
  description: "Sửa bài viết của bạn trên blog Englow3",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <Page width="focus">
      <BlogEditorView key={postId} postId={postId} />
    </Page>
  );
}
