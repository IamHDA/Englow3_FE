"use client";

import { Text, type TextProps } from "@mantine/core";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import { useLanguage } from "@/shared/hooks/useLanguage";

type TimestampProps = TextProps & {
  /** An ISO instant, as the backend sends it. */
  value: string;
  /** The time of day too, for where the moment matters: moderation. */
  withTime?: boolean;
};

/** A day in the interface language's order, as a `<time>` with the exact instant for whoever needs it. */
export function Timestamp({
  value,
  withTime = false,
  ...text
}: TimestampProps) {
  const { language } = useLanguage();
  const date = new Date(value);
  const locale = DATE_LOCALES[language];
  return (
    <Text component="time" dateTime={value} size="xs" c="ink.5" {...text}>
      {withTime
        ? date.toLocaleString(locale, {
            dateStyle: "short",
            timeStyle: "short",
          })
        : date.toLocaleDateString(locale)}
    </Text>
  );
}
