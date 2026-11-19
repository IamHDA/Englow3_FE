import { BlogEditorViewSkeleton } from "@/features/blog/components/views/BlogEditorView/BlogEditorViewSkeleton";
import { Page } from "@/shared/components/Page";

export default function EditBlogPostLoading() {
  return (
    <Page width="focus">
      <BlogEditorViewSkeleton />
    </Page>
  );
}
