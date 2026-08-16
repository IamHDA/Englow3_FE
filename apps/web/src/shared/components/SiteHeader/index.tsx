import Image from "next/image";
import Link from "next/link";

import type {
  CurrentUserQuery,
  CurrentUserQueryVariables,
} from "@/lib/graphql/generated";
import { CurrentUserDocument } from "@/lib/graphql/generated";
import { query } from "@/lib/apollo/rscClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import classes from "./SiteHeader.module.css";
import { SiteHeaderNav } from "./SiteHeaderNav";

type CurrentUserResult = {
  currentUser: CurrentUserQuery["me"] | null;
  hasError: boolean;
};

async function getCurrentUser(): Promise<CurrentUserResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No session -> skip the BFF call entirely, anonymous visitors never pay
  // for a request that would only come back UNAUTHENTICATED.
  if (!session) return { currentUser: null, hasError: false };

  try {
    const { data } = await query<CurrentUserQuery, CurrentUserQueryVariables>({
      query: CurrentUserDocument,
    });
    return { currentUser: data?.me ?? null, hasError: false };
  } catch (error) {
    // BFF/backend down, or the token expired between the check above and
    // now - degrade to the logged-out header rather than breaking the page.
    console.error("Failed to load current user for the header", error);
    return { currentUser: null, hasError: true };
  }
}

export async function SiteHeader() {
  const { currentUser, hasError } = await getCurrentUser();

  return (
    <header className={classes.header}>
      <SiteHeaderNav currentUser={currentUser} hasError={hasError}>
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
