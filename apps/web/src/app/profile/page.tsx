import type { Metadata } from "next";

import { ProfileView } from "@/features/account";
import { Page } from "@/shared/components/Page";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | Englow3",
  description: "Quản lý thông tin tài khoản và thông tin cá nhân trên Englow3",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return (
    <Page>
      <ProfileView initialTab={tab} />
    </Page>
  );
}
