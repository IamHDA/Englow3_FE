import type { Metadata } from "next";

import { FriendsView } from "@/features/friends";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Bạn bè | Englow3",
  description: "Danh sách bạn bè, lời mời kết bạn và tìm bạn mới trên Englow3",
};

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; q?: string | string[] }>;
}) {
  const { tab, q } = await searchParams;
  return (
    <Page width="wide">
      <FriendsView initialTab={tab} initialQuery={q} />
    </Page>
  );
}
