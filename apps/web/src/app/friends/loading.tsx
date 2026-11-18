// Import thẳng từ block, không qua barrel "@/features/friends": barrel còn
// re-export các view (client) cùng hook, nên một Server Component chạm vào nó
// sẽ kéo cả nhánh client vào đồ thị module của server.
import { FriendsSkeleton } from "@/features/friends/components/blocks/FriendsSkeleton";
import { Page } from "@/shared/components/Page";

export default function FriendsLoading() {
  return (
    <Page width="focus">
      <FriendsSkeleton />
    </Page>
  );
}
