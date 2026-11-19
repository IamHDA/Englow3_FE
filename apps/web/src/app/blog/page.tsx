import type { Metadata } from "next";

import { BlogListView } from "@/features/blog";
import { parseListFilters } from "@/features/blog/hooks/blogFilters";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Blog | Englow3",
  description:
    "Bài viết chia sẻ kinh nghiệm học tiếng Anh của cộng đồng Englow3",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Page width="focus">
      <BlogListView initial={parseListFilters(params)} />
    </Page>
  );
}
