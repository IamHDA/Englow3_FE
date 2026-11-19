import type { Metadata } from "next";

import { BlogEditorView } from "@/features/blog";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Viết bài | Englow3",
  description: "Viết một bài chia sẻ kinh nghiệm học tiếng Anh",
};

export default function NewBlogPostPage() {
  return (
    <Page width="focus">
      <BlogEditorView />
    </Page>
  );
}
