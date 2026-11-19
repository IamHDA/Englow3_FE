"use client";

import { Text, type TextProps } from "@mantine/core";

import { DATE_LOCALES } from "@/shared/constants/dateLocales";
import { useLanguage } from "@/shared/hooks/useLanguage";

type TimestampProps = TextProps & {
  /** An ISO instant, as the backend sends it. */
  value: string;
};

/** A day in the interface language's order, as a `<time>` with the exact instant for whoever needs it. */
export function Timestamp({ value, ...text }: TimestampProps) {
  const { language } = useLanguage();
  const date = new Date(value);
  return (
    <Text component="time" dateTime={value} size="xs" c="ink.5" {...text}>
      {date.toLocaleDateString(DATE_LOCALES[language])}
    </Text>
  );
}
