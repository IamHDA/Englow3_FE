"use client";

import { Avatar, Menu, Text, UnstyledButton } from "@mantine/core";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { useAuth } from "@/features/auth";
import { useOnboardingGuard } from "@/features/onboarding";

import classes from "./SiteHeaderUserMenu.module.css";

type SiteHeaderUserMenuProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function SiteHeaderUserMenu({
  displayName,
  avatarUrl,
}: SiteHeaderUserMenuProps) {
  // Đăng xuất đi qua AuthProvider chứ không gọi thẳng supabase ở đây: nếu gọi
  // thẳng thì có hai đường đăng xuất song song và context không biết đường nào
  // là chuẩn.
  const { signOut } = useAuth();

  // "Hồ sơ của tôi" và "Cài đặt" chặn khi chưa onboarding; "Đăng xuất" thì
  // không - đó là lối thoát cuối cùng, chặn nốt thì người dùng kẹt hẳn trong
  // tài khoản dở dang không cách nào ra.
  const guardNavigation = useOnboardingGuard();

  return (
    <Menu position="bottom-end" width={220} withinPortal>
      <Menu.Target>
        <UnstyledButton className={classes.trigger}>
          <Avatar src={avatarUrl} name={displayName} radius="xl" size={32} />
          <Text span fw={700} size="sm" c="ink.9">
            {displayName}
          </Text>
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={2.75}
            className={classes.chevron}
          />
        </UnstyledButton>
      </Menu.Target>

      {/* "Hồ sơ của tôi" và "Cài đặt" là placeholder - chưa có trang đích. */}
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<User aria-hidden="true" size={16} />}
          onClick={guardNavigation}
        >
          Hồ sơ của tôi
        </Menu.Item>
        <Menu.Item
          leftSection={<Settings aria-hidden="true" size={16} />}
          onClick={guardNavigation}
        >
          Cài đặt
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<LogOut aria-hidden="true" size={16} />}
          onClick={() => signOut()}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
