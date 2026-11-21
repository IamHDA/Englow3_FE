import type { Metadata } from "next";

import { BlogSavedView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Bài đã lưu | Englow3",
  description: "Những bài viết bạn đã lưu để đọc lại",
};

export default function BlogSavedPage() {
  return (
    <Page width="wide">
      <BlogSavedView />
    </Page>
  );
}
