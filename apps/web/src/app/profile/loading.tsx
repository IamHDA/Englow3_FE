import { Container } from "@mantine/core";

// Import thẳng từ block, không qua barrel "@/features/account": barrel còn
// re-export ProfileView cùng các hook, nên một Server Component chạm vào nó sẽ
// kéo cả nhánh client vào đồ thị module của server.
import { ProfileSkeleton } from "@/features/account/components/blocks/ProfileSkeleton";

export default function ProfileLoading() {
  return (
    <Container size="xl" py="xl">
      <ProfileSkeleton />
    </Container>
  );
}
