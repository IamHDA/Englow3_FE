"use client";

import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

import { PLANNED_CAPABILITIES } from "../../../constants/comingSoon";

/**
 * Trang giữ chỗ cho gia sư AI. Là Server Component: không có trạng thái, không
 * gọi dữ liệu, và cũng chưa có gì để gọi - phần AI đã được gỡ khỏi backend.
 */
export function AiTutorComingSoonView() {
  return (
    <Container size="lg" py={60}>
      <Stack gap="xl">
        <Stack gap="sm" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="navy.1" c="navy.9">
            <Bot size={32} />
          </ThemeIcon>
          <Badge color="orange" variant="light" size="lg" radius="sm">
            Sắp ra mắt
          </Badge>
          <Title order={1} size="h2" c="navy.9">
            Gia sư AI
          </Title>
          <Text c="ink.6" maw={620}>
            Tính năng đang được xây dựng lại từ đầu. Trong lúc chờ, bạn vẫn
            luyện được đầy đủ với thư viện đề thi thử và các bài học hằng ngày.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {PLANNED_CAPABILITIES.map(({ icon: Icon, ...capability }) => (
            <Card key={capability.title} radius="lg" withBorder p="lg">
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <ThemeIcon size="lg" radius="md" color="navy.1" c="navy.9">
                  <Icon size={20} />
                </ThemeIcon>
                <Stack gap={4}>
                  <Text fw={700} c="navy.9">
                    {capability.title}
                  </Text>
                  <Text size="sm" c="ink.6">
                    {capability.description}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Group justify="center" gap="sm">
          <Button
            component={Link}
            href="/exams"
            radius="xl"
            size="md"
            rightSection={<ArrowRight size={16} />}
          >
            Vào thư viện đề thi
          </Button>
          <Button
            component={Link}
            href="/study/daily-path"
            variant="default"
            radius="xl"
            size="md"
          >
            Lộ trình hằng ngày
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
