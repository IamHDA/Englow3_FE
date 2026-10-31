"use client";

import { Group, Text } from "@mantine/core";
import Image from "next/image";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeFooter.module.css";

export function HomeFooter() {
  const { t } = useLanguage();

  return (
    <footer className={classes.footer}>
      <Group justify="space-between" align="center" gap="md">
        <Group gap={12} align="center">
          <Image src="/englow3-mark.png" alt="" width={28} height={30} />
          <Text className={classes.tagline}>{t.home.footerTagline}</Text>
        </Group>
        <Text className={classes.meta}>
          © {new Date().getFullYear()} Englow3 · {t.home.footerProject}
        </Text>
      </Group>
    </footer>
  );
}
