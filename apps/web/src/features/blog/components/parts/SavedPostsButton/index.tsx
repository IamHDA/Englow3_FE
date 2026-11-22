"use client";

import { Badge, Button } from "@mantine/core";
import { Bookmark } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";

type SavedPostsButtonProps = {
  /** How many posts the viewer has saved, or undefined while that is being asked. */
  total: number | undefined;
  size: "lg" | "sm";
};

/** The way to the saved posts, with how many there are: in the grey panel, and again beside the list once the panel is scrolled away. */
export function SavedPostsButton({ total, size }: SavedPostsButtonProps) {
  const copy = useLanguage().t.blog.list;
  return (
    <Button
      component={Link}
      href={BLOG_ROUTES.saved}
      variant="default"
      size={size}
      aria-label={
        total === undefined
          ? copy.saved
          : copy.savedWithCount.replace("{count}", String(total))
      }
      leftSection={
        <Bookmark size={size === "lg" ? 18 : 16} aria-hidden="true" />
      }
      rightSection={
        total === undefined ? null : (
          <Badge variant="light" size={size} circle={total < 10}>
            {total}
          </Badge>
        )
      }
    >
      {copy.saved}
    </Button>
  );
}
