import { Container } from "@mantine/core";

import { ProfileSkeleton } from "@/features/account";

export default function ProfileLoading() {
  return (
    <Container size="xl" py="xl">
      <ProfileSkeleton />
    </Container>
  );
}
