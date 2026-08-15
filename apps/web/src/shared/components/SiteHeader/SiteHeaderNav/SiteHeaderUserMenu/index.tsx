"use client";

import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import classes from "./SiteHeaderUserMenu.module.css";

type SiteHeaderUserMenuProps = {
  currentUser: {
    displayName: string;
    avatarUrl: string | null;
  };
};

export function SiteHeaderUserMenu({ currentUser }: SiteHeaderUserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <Menu position="bottom-end" width={220} withinPortal>
      <Menu.Target>
        <UnstyledButton className={classes.trigger}>
          <Avatar
            src={currentUser.avatarUrl}
            name={currentUser.displayName}
            radius="xl"
            size={32}
          />
          <span className={classes.name}>{currentUser.displayName}</span>
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
        <Menu.Item leftSection={<User aria-hidden="true" size={16} />}>
          Hồ sơ của tôi
        </Menu.Item>
        <Menu.Item leftSection={<Settings aria-hidden="true" size={16} />}>
          Cài đặt
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<LogOut aria-hidden="true" size={16} />}
          onClick={() => void handleSignOut()}
        >
          Đăng xuất
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
