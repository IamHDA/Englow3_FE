import type { Metadata } from "next";

import { BlogPostView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Bài viết | Englow3",
  description: "Đọc bài viết trên blog Englow3",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <Page width="focus">
      <BlogPostView key={postId} postId={postId} />
    </Page>
  );
}
