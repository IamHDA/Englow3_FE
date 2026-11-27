// Straight from the view's folder, not the "@/features/blog" barrel: see the note
// in features/blog/index.ts.
import { AdminBlogQueueViewSkeleton } from "@/features/blog/components/views/AdminBlogQueueView/AdminBlogQueueViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function AdminBlogLoading() {
  return (
    <Page>
      <AdminBlogQueueViewSkeleton />
    </Page>
  );
}
