"use client";

import { Button, Group, Paper, Text } from "@mantine/core";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./CookieNotice.module.css";

const STORAGE_KEY = "englow3_cookie_notice";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function seen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Storage blocked: showing the notice on every page would be worse than
    // not showing it, and the notice is information, not a consent gate.
    return true;
  }
}

function acknowledge() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Nothing to remember it with; the notice goes away for this page view.
  }
  listeners.forEach((listener) => listener());
}

const copy = {
  vi: {
    text: "Englow3 chỉ dùng cookie cần thiết để giữ bạn đăng nhập. Không có cookie quảng cáo hay theo dõi.",
    more: "Chính sách bảo mật",
    ok: "Đã hiểu",
    label: "Thông báo về cookie",
  },
  en: {
    text: "Englow3 only uses the cookies it needs to keep you signed in. There are no advertising or tracking cookies.",
    more: "Privacy policy",
    ok: "Got it",
    label: "Cookie notice",
  },
} as const;

/**
 * Tells a visitor, once, what the site stores. It is a notice and not a
 * choice: the only cookie is the sign-in session, which the site cannot work
 * without. If analytics or advertising is ever added, this has to become a
 * real consent prompt that gates them.
 */
export function CookieNotice() {
  const { language } = useLanguage();
  // On the server the notice counts as seen, so the page renders without it
  // and a first-time visitor gets it right after hydration with no mismatch.
  const dismissed = useSyncExternalStore(subscribe, seen, () => true);
  if (dismissed) return null;
  const c = copy[language];

  return (
    <Paper
      role="region"
      aria-label={c.label}
      withBorder
      shadow="md"
      radius="lg"
      p="md"
      className={classes.notice}
    >
      <Group justify="space-between" align="center" gap="md" wrap="wrap">
        <Text size="sm" c="ink.8" className={classes.text}>
          {c.text}{" "}
          <Link href="/privacy" className={classes.link}>
            {c.more}
          </Link>
        </Text>
        <Button size="xs" color="navy.9" radius="md" onClick={acknowledge}>
          {c.ok}
        </Button>
      </Group>
    </Paper>
  );
}
