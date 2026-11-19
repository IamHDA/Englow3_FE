// Import thẳng từ block, không qua barrel "@/features/friends": xem
// app/friends/loading.tsx.
import { WallPostsSkeleton } from "@/features/blog/components/blocks/WallPosts/WallPostsSkeleton";
import { WallSkeleton } from "@/features/friends/components/blocks/WallSkeleton";
import { Page } from "@/shared/components/Page";

export default function PersonLoading() {
  return (
    <Page width="focus">
      <WallSkeleton />
      <WallPostsSkeleton />
    </Page>
  );
}
