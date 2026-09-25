import { Loader, Stack, Text } from "@mantine/core";
import Image from "next/image";

import classes from "./PageLoader.module.css";

type PageLoaderProps = {
  label?: string;
};

/**
 * The page-level wait: the brand mark, a spinner, and one line saying what is
 * happening. For routes without a skeleton of their own - a skeleton is better
 * where the layout is known, this is for where it is not.
 */
export function PageLoader({ label = "Đang tải…" }: PageLoaderProps) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="md"
      mih="60vh"
      role="status"
      aria-live="polite"
    >
      <Image
        src="/englow3-mark.png"
        alt=""
        width={48}
        height={52}
        className={classes.mark}
        priority
      />
      <Loader color="orange.5" type="dots" size="md" />
      <Text size="sm" c="ink.6">
        {label}
      </Text>
    </Stack>
  );
}
