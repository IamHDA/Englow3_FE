"use client";

import { Burger, Drawer, Group, Menu, Stack, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

import {
  primaryLinks,
  studyIcon as StudyIcon,
  studyLinks,
} from "@/shared/constants/navigation";

import { SiteHeaderLoginButton } from "./SiteHeaderLoginButton";
import classes from "./SiteHeaderNav.module.css";
import { StudyMenuDropdown } from "./StudyMenuDropdown";

export function SiteHeaderNav() {
  const [drawerOpened, drawer] = useDisclosure(false);

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
              Study
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

        <SiteHeaderLoginButton />
      </Group>

      <Burger
        opened={drawerOpened}
        onClick={drawer.toggle}
        hiddenFrom="md"
        aria-label="Toggle navigation"
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
              <span className={classes.drawerIconTile}>
                <Icon aria-hidden="true" size={18} />
              </span>
              <span className={classes.drawerLinkText}>
                <span className={classes.drawerLinkLabel}>{link.label}</span>
                <span className={classes.drawerLinkDescription}>
                  {link.description}
                </span>
              </span>
            </Link>
          ))}

          {primaryLinks.map(({ icon: Icon, ...link }) => (
            <Link
              key={link.href}
              href={link.href}
              className={classes.drawerLink}
              onClick={drawer.close}
            >
              <span className={classes.drawerIconTile}>
                <Icon aria-hidden="true" size={18} />
              </span>
              <span className={classes.drawerLinkLabel}>{link.label}</span>
            </Link>
          ))}

          <SiteHeaderLoginButton onNavigate={drawer.close} fullWidth />
        </Stack>
      </Drawer>
    </>
  );
}
