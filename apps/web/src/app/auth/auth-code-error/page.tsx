import { Button, Container, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign-in could not be completed — Englow3",
};

export default function AuthCodeErrorPage() {
  return (
    <Container size="sm" py={80}>
      <Stack gap="md" align="flex-start">
        <Title order={1} fz={28}>
          Sign-in could not be completed
        </Title>
        <Text c="slate.6">
          The link from your provider was missing, already used, or expired.
          Nothing was changed on your account — start again from the home page.
        </Text>
        {/* A plain anchor: a component reference cannot cross into Mantine's
            client Button from this Server Component, and a full reload is the
            right thing after a failed auth round trip anyway. */}
        <Button component="a" href="/" variant="outline" color="navy.9" mt="sm">
          Back to home
        </Button>
      </Stack>
    </Container>
  );
}
