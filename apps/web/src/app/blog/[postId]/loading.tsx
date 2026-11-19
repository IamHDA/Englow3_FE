import { BlogPostViewSkeleton } from "@/features/blog/components/views/BlogPostView/BlogPostViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function BlogPostLoading() {
  return (
    <Page width="focus">
      <BlogPostViewSkeleton />
    </Page>
  );
}
