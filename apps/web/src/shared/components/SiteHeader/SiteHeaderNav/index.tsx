"use client";

import {
  Burger,
  Center,
  Drawer,
  Flex,
  Group,
  Menu,
  SimpleGrid,
  Stack,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import { useAuth } from "@/features/auth";
import { useOnboarding, useOnboardingGuard } from "@/features/onboarding";
import {
  primaryLinks,
  studyIcon as StudyIcon,
  studyLinks,
} from "@/shared/constants/navigation";

import { SiteHeaderLoginButton } from "./SiteHeaderLoginButton";
import classes from "./SiteHeaderNav.module.css";
import { SiteHeaderOnboardingButton } from "./SiteHeaderOnboardingButton";
import { SiteHeaderUserMenu } from "./SiteHeaderUserMenu";

/** Active tab matches the link itself or any of its sub-routes. */
function isLinkActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Đang đăng nhập nhưng BFF không trả về tên, và tài khoản cũng không có email. */
const ACCOUNT_FALLBACK_NAME = "Tài khoản";

type SiteHeaderNavProps = {
  /** The logo, rendered by the Server Component parent (SiteHeader). */
  children: ReactNode;
};

export function SiteHeaderNav({ children }: SiteHeaderNavProps) {
  const [drawerOpened, drawer] = useDisclosure(false);
  const pathname = usePathname();
  const isStudyActive = isLinkActive(pathname, "/study");

  // Hai nguồn tách biệt: `session` quyết định hiện nút đăng nhập hay menu tài
  // khoản, `profile` chỉ lo tên và avatar. BFF hỏng thì mất tên chứ không đá
  // người dùng về trạng thái khách.
  const { session } = useAuth();
  const { profile } = useAccountProfile();
  const accountName =
    profile?.displayName ?? session?.email ?? ACCOUNT_FALLBACK_NAME;

  // Chặn điều hướng tới các trang chức năng khi chưa onboarding xong; nút nhắc
  // ở header dùng `requiresOnboarding` trực tiếp để quyết định có hiện không.
  const { requiresOnboarding } = useOnboarding();
  const guardNavigation = useOnboardingGuard();

  return (
    <Fragment>
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="md"
        className={classes.inner}
      >
        <Group gap={16} wrap="nowrap">
          {children}

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
                <UnstyledButton
                  className={classes.link}
                  data-active={isStudyActive || undefined}
                >
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
              <Menu.Dropdown className={classes.studyDropdown}>
                <SimpleGrid cols={2} spacing={4}>
                  {studyLinks.map(({ icon: Icon, ...link }) => (
                    <Menu.Item
                      key={link.href}
                      component={Link}
                      href={link.href}
                      onClick={guardNavigation}
                      leftSection={
                        <Center
                          component="span"
                          className={classes.studyIconTile}
                        >
                          <Icon aria-hidden="true" size={20} />
                        </Center>
                      }
                      classNames={{
                        item: classes.studyItem,
                        itemLabel: classes.studyItemLabel,
                        itemSection: classes.studyItemSection,
                      }}
                    >
                      <span className={classes.studyLabel}>{link.label}</span>
                      <span className={classes.studyDescription}>
                        {link.description}
                      </span>
                    </Menu.Item>
                  ))}
                </SimpleGrid>
              </Menu.Dropdown>
            </Menu>

            {primaryLinks.map(({ icon: Icon, ...link }) => (
              <Link
                key={link.href}
                href={link.href}
                className={classes.link}
                data-active={isLinkActive(pathname, link.href) || undefined}
                onClick={guardNavigation}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={2.5} />
                {link.label}
              </Link>
            ))}
          </Group>
        </Group>

        <Group gap={4} wrap="nowrap">
          <Group visibleFrom="md" gap={12}>
            {session ? (
              <>
                {requiresOnboarding ? <SiteHeaderOnboardingButton /> : null}
                <SiteHeaderUserMenu
                  displayName={accountName}
                  avatarUrl={profile?.avatarUrl ?? null}
                />
              </>
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
        </Group>
      </Group>

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
              onClick={(event) => {
                guardNavigation(event);
                drawer.close();
              }}
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
              onClick={(event) => {
                guardNavigation(event);
                drawer.close();
              }}
            >
              <Center component="span" className={classes.drawerIconTile}>
                <Icon aria-hidden="true" size={18} />
              </Center>
              <span className={classes.drawerLinkLabel}>{link.label}</span>
            </Link>
          ))}

          {session && requiresOnboarding ? (
            <SiteHeaderOnboardingButton onNavigate={drawer.close} fullWidth />
          ) : null}

          {session ? (
            <SiteHeaderUserMenu
              displayName={accountName}
              avatarUrl={profile?.avatarUrl ?? null}
            />
          ) : (
            <SiteHeaderLoginButton onNavigate={drawer.close} fullWidth />
          )}
        </Stack>
      </Drawer>
    </Fragment>
  );
}
