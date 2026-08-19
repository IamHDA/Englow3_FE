import Image from "next/image";
import Link from "next/link";

import classes from "./SiteHeader.module.css";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className={classes.header}>
      <SiteHeaderNav>
        {/*
          A plain Link rather than `<Center component={Link}>`: this header is a
          Server Component, and passing an already-rendered element as
          children is fine - it's passing the Link *component reference*
          across the boundary that isn't.
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
      </SiteHeaderNav>
    </header>
  );
}
