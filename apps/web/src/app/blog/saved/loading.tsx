// Straight from the view's folder, not the "@/features/blog" barrel: see the note
// in features/blog/index.ts.
import { BlogSavedViewSkeleton } from "@/features/blog/components/views/BlogSavedView/BlogSavedViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function BlogSavedLoading() {
  return (
    <Page width="wide">
      <BlogSavedViewSkeleton />
    </Page>
  );
}
