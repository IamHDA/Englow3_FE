import type { Metadata } from "next";

import { AdminBlogActionsView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Lịch sử kiểm duyệt blog | Englow3",
  description:
    "Những gì đội ngũ kiểm duyệt đã làm gần đây với bài viết và bình luận.",
};

export default function AdminBlogActionsPage() {
  return (
    <Page width="focus">
      <AdminBlogActionsView />
    </Page>
  );
}
