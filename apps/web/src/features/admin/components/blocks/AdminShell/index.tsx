"use client";
import {
  AppShell,
  Badge,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ArrowLeft,
  ClipboardList,
  CircleHelp,
  Layers,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAccountProfile } from "@/features/account";
import { useAuth } from "@/features/auth";
import { useUserTour } from "@/features/tour";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useAssessmentWorkloadQuery } from "@/lib/graphql/generated/hooks";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { session, signOut } = useAuth();
  const { profile } = useAccountProfile();
  const { replay } = useUserTour();
  const { isVi, toggleLanguage } = useLanguage();
  const admin = session?.role === "ADMIN";
  const workload = useAssessmentWorkloadQuery({
    fetchPolicy: "cache-and-network",
    skip: !session,
  });
  const pending = workload.data
    ? workload.data.assessmentWorkload.needsReview +
      workload.data.assessmentWorkload.failed +
      (admin
        ? workload.data.assessmentWorkload.pendingReview
        : workload.data.assessmentWorkload.rejected)
    : null;
  const nav = [
    {
      href: "/admin",
      label: admin
        ? isVi
          ? "Tổng quan"
          : "Overview"
        : isVi
          ? "Công việc của tôi"
          : "My work",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/content",
      label: isVi ? "Nội dung học" : "Learning content",
      icon: Layers,
    },
    {
      href: "/admin/exams",
      label: isVi ? "Đề thi" : "Exams",
      icon: ClipboardList,
    },
    {
      href: "/admin/assessments",
      label: "Writing & Speaking",
      icon: ClipboardList,
    },
  ];
  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 264, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label={isVi ? "Mở menu" : "Open navigation"}
            />
            <Link
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <Image src="/englow3-mark.png" alt="" width={27} height={30} />
              <Text fw={800} c="navy.9">
                Englow3
              </Text>
            </Link>
            <Badge color={admin ? "navy" : "teal"}>
              {admin ? "Admin" : "Staff"}
            </Badge>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Text size="sm" c="ink.7" truncate visibleFrom="md">
              {profile?.displayName ?? session?.email}
            </Text>
            <Button
              size="compact-sm"
              variant="default"
              onClick={toggleLanguage}
              aria-label={
                isVi ? "Chuyển sang tiếng Anh" : "Switch to Vietnamese"
              }
            >
              {isVi ? "EN" : "VI"}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="lg">
            <Stack gap={4} px="xs" pt="sm">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                {isVi ? "Không gian làm việc" : "Workspace"}
              </Text>
              <Text fw={700}>
                {admin
                  ? isVi
                    ? "Duyệt và kiểm tra chất lượng"
                    : "Review and quality"
                  : isVi
                    ? "Soạn nội dung và chấm bài"
                    : "Authoring and grading"}
              </Text>
            </Stack>
            <Stack gap={6}>
              {nav.map(({ href, label, icon: Icon, exact }) => (
                <NavLink
                  key={href}
                  component={Link}
                  href={href}
                  label={label}
                  leftSection={<Icon size={19} aria-hidden />}
                  rightSection={
                    href === "/admin/assessments" &&
                    pending !== null &&
                    pending > 0 ? (
                      <Badge size="sm" color="orange">
                        {pending}
                      </Badge>
                    ) : undefined
                  }
                  active={exact ? pathname === href : pathname.startsWith(href)}
                  onClick={close}
                  color="navy"
                  variant="light"
                  style={{ borderRadius: 12, minHeight: 46 }}
                  fw={600}
                />
              ))}
            </Stack>
            <Divider />
            <Text size="sm" c="dimmed" px="xs">
              {isVi
                ? admin
                  ? "Xem nội dung đầy đủ trước khi duyệt. Mọi điều chỉnh điểm đều có lịch sử."
                  : "Bản nháp được giữ riêng. Gửi duyệt khi nội dung đã sẵn sàng."
                : admin
                  ? "Preview content before approval. Grade changes retain their history."
                  : "Keep drafts until content is ready for review."}
            </Text>
          </Stack>
        </AppShell.Section>
        <AppShell.Section>
          <Stack gap={4}>
            <Button
              variant="subtle"
              color="ink"
              justify="flex-start"
              leftSection={<CircleHelp size={16} />}
              onClick={() => {
                close();
                replay();
              }}
            >
              {isVi ? "Hướng dẫn sử dụng" : "Help tour"}
            </Button>
            <Button
              component={Link}
              href="/"
              variant="subtle"
              color="ink"
              justify="flex-start"
              leftSection={<ArrowLeft size={16} />}
            >
              {isVi ? "Về trang học viên" : "Learner site"}
            </Button>
            <Button
              variant="subtle"
              color="warn"
              justify="flex-start"
              leftSection={<LogOut size={16} />}
              onClick={() => void signOut()}
            >
              {isVi ? "Đăng xuất" : "Sign out"}
            </Button>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg="ink.0">{children}</AppShell.Main>
    </AppShell>
  );
}
