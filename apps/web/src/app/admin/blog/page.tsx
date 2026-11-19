import type { Metadata } from "next";

import { AdminBlogQueueView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Kiểm duyệt blog | Englow3",
  description:
    "Hàng đợi bài viết và bình luận bị báo cáo, dành cho đội ngũ kiểm duyệt.",
};

export default function AdminBlogPage() {
  return (
    <Page width="focus">
      <AdminBlogQueueView />
    </Page>
  );
}
