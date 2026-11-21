"use client";

import { ActionIcon } from "@mantine/core";
import { Bookmark } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./SaveButton.module.css";

type SaveButtonProps = {
  saved: boolean;
  /** A save or an unsave is on its way: a second press is ignored until it lands. */
  pending: boolean;
  onToggle: () => void;
};

/** The bookmark on a post: filled when the viewer saved it. Pressing it turns it the other way. */
export function SaveButton({ saved, pending, onToggle }: SaveButtonProps) {
  const copy = useLanguage().t.blog.save;
  return (
    <ActionIcon
      variant="default"
      size={44}
      className={classes.button}
      data-saved={saved ? "" : undefined}
      aria-pressed={saved}
      aria-label={saved ? copy.unsave : copy.save}
      aria-busy={pending}
      onClick={onToggle}
    >
      <Bookmark size={20} aria-hidden="true" className={classes.icon} />
    </ActionIcon>
  );
}
