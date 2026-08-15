import { Group } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

import type {
  CurrentUserQuery,
  CurrentUserQueryVariables,
} from "@/lib/graphql/generated";
import { CurrentUserDocument } from "@/lib/graphql/generated";
import { query } from "@/lib/apollo/rscClient";
import { notifications } from "@mantine/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import classes from "./SiteHeader.module.css";
import { SiteHeaderNav } from "./SiteHeaderNav";

async function getCurrentUser(): Promise<CurrentUserQuery["me"] | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No session -> skip the BFF call entirely, anonymous visitors never pay
  // for a request that would only come back UNAUTHENTICATED.
  if (!session) return null;

  try {
    const { data } = await query<CurrentUserQuery, CurrentUserQueryVariables>({
      query: CurrentUserDocument,
    });
    return data?.me ?? null;
  } catch (error) {
    // BFF/backend down, or the token expired between the check above and
    // now - degrade to the logged-out header rather than breaking the page.
    console.error("Failed to load current user for the header", error);
    notifications.show({
      color: "warn",
      title: "Lỗi lấy thông tin người dùng",
      message: "Vui lòng đăng nhập lại",
    });
    return null;
  }
}

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

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
        <SiteHeaderNav currentUser={currentUser} />
      </Group>
    </header>
  );
}
