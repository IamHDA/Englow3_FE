"use client";

import { Button } from "@mantine/core";
import { Heart } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { countLabel } from "../../../constants/blogLabels";

import classes from "./LikeButton.module.css";

type LikeButtonProps = {
  liked: boolean;
  count: number;
  /** A like or an unlike is on its way: the button waits for it. */
  pending: boolean;
  onToggle: () => void;
};

/** The heart under a post: filled when the viewer likes it, with how many do. Pressing it turns it the other way. */
export function LikeButton({
  liked,
  count,
  pending,
  onToggle,
}: LikeButtonProps) {
  const copy = useLanguage().t.blog.post;
  return (
    <Button
      variant={liked ? "light" : "default"}
      color={liked ? "warn" : "ink"}
      aria-pressed={liked}
      aria-label={`${liked ? copy.unlike : copy.like}, ${countLabel(count, copy.likesOne, copy.likesOther)}`}
      disabled={pending}
      onClick={onToggle}
      leftSection={
        <Heart
          size={18}
          aria-hidden="true"
          className={classes.heart}
          data-liked={liked ? "" : undefined}
        />
      }
    >
      {count}
    </Button>
  );
}
