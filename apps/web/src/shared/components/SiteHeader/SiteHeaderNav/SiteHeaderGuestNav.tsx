"use client";

import { Burger, Button, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { landingFont } from "@/shared/styles/landingFont";
import classes from "./SiteHeaderNav.module.css";

export function SiteHeaderGuestNav({
  children,
  onLogin,
  accountHref,
}: {
  children: ReactNode;
  onLogin: () => void;
  accountHref?: string;
}) {
  const { isVi, setLanguage } = useLanguage();
  const [opened, drawer] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const links = [
    { href: "#how-it-works", label: isVi ? "Cách học" : "How it works" },
    { href: "#learning-path", label: isVi ? "Tầm nhìn" : "Our vision" },
    { href: "#features", label: isVi ? "Tính năng" : "Features" },
  ];
  return (
    <>
      <Group
        justify="space-between"
        wrap="nowrap"
        className={`${classes.inner} ${classes.landingNav} ${landingFont.variable}`}
        data-landing-nav
        data-scrolled={scrolled || undefined}
      >
        {children}
        <Group
          component="nav"
          aria-label={isVi ? "Giới thiệu Englow3" : "About Englow3"}
          gap={0}
          visibleFrom="md"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} className={classes.landingLink}>
              {link.label}
            </a>
          ))}
        </Group>
        <Group gap={0} wrap="nowrap" className={classes.landingActions}>
          <button
            type="button"
            aria-label="English"
            aria-pressed={!isVi}
            onClick={() => setLanguage("en")}
            className={classes.landingLanguage}
          >
            <span>EN</span>
          </button>
          <button
            type="button"
            aria-label="Tiếng Việt"
            aria-pressed={isVi}
            onClick={() => setLanguage("vi")}
            className={classes.landingLanguage}
          >
            <span>VI</span>
          </button>
          <Burger
            opened={opened}
            onClick={drawer.toggle}
            hiddenFrom="md"
            size={20}
            w={44}
            h={44}
            color="white"
            aria-label={isVi ? "Mở menu giới thiệu" : "Open introduction menu"}
            aria-expanded={opened}
          />
        </Group>
      </Group>
      <Drawer
        opened={opened}
        onClose={drawer.close}
        position="right"
        size="xs"
        title={isVi ? "Khám phá Englow3" : "Explore Englow3"}
        hiddenFrom="md"
        closeButtonProps={{
          size: 44,
          "aria-label": isVi ? "Đóng menu" : "Close menu",
        }}
      >
        <Stack gap={12}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={drawer.close}
              className={classes.guestLink}
            >
              {link.label}
            </a>
          ))}
          {accountHref ? (
            <Button component={Link} href={accountHref} color="brand.7">
              {isVi ? "Vào tài khoản" : "Open account"}
            </Button>
          ) : (
            <Button
              color="brand.7"
              onClick={() => {
                drawer.close();
                onLogin();
              }}
            >
              {isVi ? "Đăng nhập" : "Sign in"}
            </Button>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
