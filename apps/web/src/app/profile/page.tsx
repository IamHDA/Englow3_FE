import { Container } from "@mantine/core";
import type { Metadata } from "next";

import { ProfileView } from "@/features/account";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | Englow3",
  description: "Quản lý thông tin tài khoản và thông tin cá nhân trên Englow3",
};

export default function ProfilePage() {
  return (
    <Container size="xl" py="xl">
      <ProfileView />
    </Container>
  );
}
