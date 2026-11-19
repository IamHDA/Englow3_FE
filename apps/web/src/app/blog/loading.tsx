// Straight from the view's folder, not the "@/features/blog" barrel: see the note
// in features/blog/index.ts.
import { BlogListViewSkeleton } from "@/features/blog/components/views/BlogListView/BlogListViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function BlogLoading() {
  return (
    <Page width="focus">
      <BlogListViewSkeleton />
    </Page>
  );
}
