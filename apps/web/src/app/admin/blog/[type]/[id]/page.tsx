import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminBlogTargetView, TARGET_TYPE_SEGMENT } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Chi tiết nội dung bị báo cáo | Englow3",
  description:
    "Nội dung, báo cáo và lịch sử xử lý của một bài viết hoặc bình luận.",
};

export default async function AdminBlogTargetPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  // The address says the type in lower case, as the backend's routes do.
  if (!Object.hasOwn(TARGET_TYPE_SEGMENT, type)) notFound();
  const targetType =
    TARGET_TYPE_SEGMENT[type as keyof typeof TARGET_TYPE_SEGMENT];
  return (
    <Page width="focus">
      <AdminBlogTargetView key={`${type}:${id}`} type={targetType} id={id} />
    </Page>
  );
}
