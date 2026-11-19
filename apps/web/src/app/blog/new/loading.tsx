import { BlogEditorViewSkeleton } from "@/features/blog/components/views/BlogEditorView/BlogEditorViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function NewBlogPostLoading() {
  return (
    <Page width="focus">
      <BlogEditorViewSkeleton />
    </Page>
  );
}
