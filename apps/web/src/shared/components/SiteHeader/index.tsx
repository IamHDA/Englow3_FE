import Image from "next/image";
import Link from "next/link";

import classes from "./SiteHeader.module.css";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Link href="/" className={classes.logoLink} aria-label="Englow3 home">
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
      </div>
    </header>
  );
}
