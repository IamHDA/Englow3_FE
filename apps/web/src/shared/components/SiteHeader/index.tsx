import { Group } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import classes from "./SiteHeader.module.css";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className={classes.header}>
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="md"
        className={classes.inner}
      >
        {/*
          A plain Link rather than `<Center component={Link}>`: this header is a
          Server Component, and passing Link into a Mantine client component
          would send a function across the boundary.
        */}
        <Link
          href="/"
          className={classes.logoLink}
          aria-label="Trang chủ Englow3"
        >
          <Image
            src="/englow3-logo.png"
            alt="Englow3"
            width={359}
            height={112}
            sizes="(min-width: 62em) 154px, 116px"
            className={classes.logo}
            priority
          />
        </Link>
        <SiteHeaderNav />
      </Group>
    </header>
  );
}
