"use client";

import {
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ArrowLeft,
  ClipboardList,
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

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Nội dung học", icon: Layers },
  { href: "/admin/exams", label: "Đề thi", icon: ClipboardList },
];

type AdminShellProps = {
  children: ReactNode;
};

/**
 * The administration area's own frame: a sidebar of its sections instead of
 * the learner's header, whose Study / Exams / Tutor links mean nothing to
 * someone reviewing content. A way back to the learner site stays at the foot.
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);
  const { session, signOut } = useAuth();
  const { profile } = useAccountProfile();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <AppShell
      header={{ height: 56, collapsed: false }}
      navbar={{ width: 248, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Mở menu quản trị"
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
              <Image src="/englow3-mark.png" alt="" width={26} height={28} />
              <Text fw={800} c="navy.9">
                Englow3{" "}
                <Text span c="orange.6" fw={800}>
                  Admin
                </Text>
              </Text>
            </Link>
          </Group>
          <Text size="sm" c="ink.6" truncate visibleFrom="sm">
            {profile?.displayName ?? session?.email}
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow>
          <Stack gap={4}>
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <NavLink
                key={href}
                component={Link}
                href={href}
                label={label}
                leftSection={<Icon size={18} aria-hidden="true" />}
                active={isActive(href, exact)}
                onClick={close}
                color="navy"
                variant="light"
                style={{ borderRadius: 10 }}
                fw={600}
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack gap={6}>
            <Button
              component={Link}
              href="/"
              variant="subtle"
              color="ink"
              justify="flex-start"
              leftSection={<ArrowLeft size={16} aria-hidden="true" />}
            >
              Về trang học viên
            </Button>
            <Button
              variant="subtle"
              color="warn"
              justify="flex-start"
              leftSection={<LogOut size={16} aria-hidden="true" />}
              onClick={() => signOut()}
            >
              Đăng xuất
            </Button>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main bg="ink.0">{children}</AppShell.Main>
    </AppShell>
  );
}
