"use client";

import { Anchor, Avatar, Group } from "@mantine/core";
import Link from "next/link";

import { BLOG_ROUTES } from "../../../constants/blog";
import type { BlogAuthorData } from "../../../types";

import { DeletedAuthor } from "./DeletedAuthor";

type AuthorChipProps = {
  /** Null when the account was erased. */
  author: BlogAuthorData | null;
  size?: number;
};

/** Picture and name of whoever wrote a post or a comment, a link to their wall - or "deleted user" for an erased account. */
export function AuthorChip({ author, size = 28 }: AuthorChipProps) {
  if (!author) return <DeletedAuthor size={size} />;
  return (
    <Group gap="xs" wrap="nowrap" miw={0}>
      <Avatar
        src={author.avatarUrl}
        name={author.displayName}
        radius="xl"
        size={size}
        aria-hidden="true"
      />
      <Anchor
        component={Link}
        href={BLOG_ROUTES.wall(author.userId)}
        size="sm"
        fw={600}
        c="ink.8"
        truncate
      >
        {author.displayName}
      </Anchor>
    </Group>
  );
}
