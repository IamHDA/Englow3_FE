"use client";

import {
  Burger,
  Center,
  Drawer,
  Flex,
  Group,
  Menu,
  Stack,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import {
  primaryLinks,
  studyIcon as StudyIcon,
  studyLinks,
} from "@/shared/constants/navigation";

import { SiteHeaderLoginButton } from "./SiteHeaderLoginButton";
import classes from "./SiteHeaderNav.module.css";
import { SiteHeaderUserMenu } from "./SiteHeaderUserMenu";
import { StudyMenuDropdown } from "./StudyMenuDropdown";

type SiteHeaderNavProps = {
  currentUser: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
  hasError: boolean;
};

export function SiteHeaderNav({ currentUser, hasError }: SiteHeaderNavProps) {
  const [drawerOpened, drawer] = useDisclosure(false);

  useEffect(() => {
    if (!hasError) return;
    notifications.show({
      color: "warn",
      title: "Lỗi lấy thông tin người dùng",
      message: "Vui lòng đăng nhập lại",
    });
  }, [hasError]);

  return (
    <>
      <Group gap={4} visibleFrom="md" wrap="nowrap">
        <Menu
          position="bottom-start"
          // The dropdown pads its items by 18px (8px dropdown + 10px item)
          // while the trigger pads its label by 14px, so pulling the panel
          // 4px left lines the first item up with the word "Study".
          offset={{ mainAxis: 8, alignmentAxis: -4 }}
          width={520}
          withinPortal
        >
          <Menu.Target>
            <UnstyledButton className={classes.link}>
              <StudyIcon aria-hidden="true" size={16} strokeWidth={2.5} />
              Học tập
              <ChevronDown
                aria-hidden="true"
                size={16}
                strokeWidth={2.75}
                className={classes.chevron}
              />
            </UnstyledButton>
          </Menu.Target>
          <StudyMenuDropdown />
        </Menu>

        {primaryLinks.map(({ icon: Icon, ...link }) => (
          <Link key={link.href} href={link.href} className={classes.link}>
            <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
            {link.label}
          </Link>
        ))}

        {currentUser ? (
          <SiteHeaderUserMenu currentUser={currentUser} />
        ) : (
          <SiteHeaderLoginButton />
        )}
      </Group>

      <Burger
        opened={drawerOpened}
        onClick={drawer.toggle}
        hiddenFrom="md"
        aria-label="Chuyển đổi menu điều hướng"
      />

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        position="right"
        size="xs"
        title="Menu"
        hiddenFrom="md"
      >
        <Stack gap={2}>
          {studyLinks.map(({ icon: Icon, ...link }) => (
            <Link
              key={link.href}
              href={link.href}
              className={classes.drawerLink}
              onClick={drawer.close}
            >
              <Center component="span" className={classes.drawerIconTile}>
                <Icon aria-hidden="true" size={18} />
              </Center>
              <Flex component="span" direction="column" gap={2} miw={0}>
                <span className={classes.drawerLinkLabel}>{link.label}</span>
                <span className={classes.drawerLinkDescription}>
                  {link.description}
                </span>
              </Flex>
            </Link>
          ))}

          {primaryLinks.map(({ icon: Icon, ...link }) => (
            <Link
              key={link.href}
              href={link.href}
              className={classes.drawerLink}
              onClick={drawer.close}
            >
              <Center component="span" className={classes.drawerIconTile}>
                <Icon aria-hidden="true" size={18} />
              </Center>
              <span className={classes.drawerLinkLabel}>{link.label}</span>
            </Link>
          ))}

          {currentUser ? (
            <SiteHeaderUserMenu currentUser={currentUser} />
          ) : (
            <SiteHeaderLoginButton onNavigate={drawer.close} fullWidth />
          )}
        </Stack>
      </Drawer>
    </>
  );
}
