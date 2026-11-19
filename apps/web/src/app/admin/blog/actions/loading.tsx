import { AdminBlogActionsViewSkeleton } from "@/features/blog/components/views/AdminBlogActionsView/AdminBlogActionsViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function AdminBlogActionsLoading() {
  return (
    <Page width="focus">
      <AdminBlogActionsViewSkeleton />
    </Page>
  );
}
