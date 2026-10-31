"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./SkipLink.module.css";

/**
 * The first stop for a keyboard user: jumps past the header to the page. Off
 * screen until it has focus, so it never shows for a mouse user.
 */
export function SkipLink() {
  const { isVi } = useLanguage();
  return (
    <a href="#main-content" className={classes.link}>
      {isVi ? "Bỏ qua tới nội dung chính" : "Skip to main content"}
    </a>
  );
}
