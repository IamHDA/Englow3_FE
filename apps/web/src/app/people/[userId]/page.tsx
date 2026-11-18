import type { Metadata } from "next";

import { WallView } from "@/features/friends";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Trang cá nhân | Englow3",
  description: "Trang cá nhân của một thành viên trên Englow3",
};

export default async function PersonPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <Page width="focus">
      <WallView key={userId} userId={userId} />
    </Page>
  );
}
