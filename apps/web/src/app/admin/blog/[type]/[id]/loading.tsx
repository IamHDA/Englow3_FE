import { AdminBlogTargetViewSkeleton } from "@/features/blog/components/views/AdminBlogTargetView/AdminBlogTargetViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function AdminBlogTargetLoading() {
  return (
    <Page width="focus">
      <AdminBlogTargetViewSkeleton />
    </Page>
  );
}
