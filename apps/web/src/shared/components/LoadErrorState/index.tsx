"use client";

import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { ArrowLeft, RotateCw, SearchX, WifiOff } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { loadErrorKind, type LoadErrorKind } from "@/shared/network/loadError";

type LoadErrorStateProps = {
  error?: unknown;
  /** Set when the page already knows, without an error to read it from. */
  kind?: LoadErrorKind;
  /** What was being opened, as the sentence needs it: "bộ thẻ", "bài nghe"... */
  thing: { vi: string; en: string };
  back: { href: string; label: string };
  /** Offered only when the server failed - retrying a missing thing is pointless. */
  onRetry?: () => void;
};

/**
 * What a detail page shows when it cannot show its subject. Every such page
 * used to say something different - one blamed the connection for an id that
 * does not exist, one went blank, one offered to start a quiz that was not
 * there - and some left no way back. This tells the two cases apart: a thing that does not
 * exist (say so, and point back to the library) and a server that did not
 * answer (say so, and offer to try again).
 */
export function LoadErrorState({
  error,
  kind,
  thing,
  back,
  onRetry,
}: LoadErrorStateProps) {
  const { isVi } = useLanguage();
  const notFound = (kind ?? loadErrorKind(error)) === "not-found";
  const name = isVi ? thing.vi : thing.en;

  const title = notFound
    ? isVi
      ? `Không tìm thấy ${name}`
      : `This ${name} does not exist`
    : isVi
      ? `Không tải được ${name}`
      : `Could not load this ${name}`;
  const description = notFound
    ? isVi
      ? `${name[0].toUpperCase()}${name.slice(1)} không tồn tại hoặc đã bị gỡ. Hãy chọn lại từ thư viện.`
      : `It may have been removed, or the link is wrong. Pick one from the library instead.`
    : isVi
      ? "Máy chủ chưa phản hồi. Thử lại sau ít phút."
      : "The server did not answer. Try again in a few minutes.";

  return (
    <Stack align="center" gap="md" py={60} role="alert">
      <ThemeIcon
        size={56}
        radius="xl"
        variant="light"
        color={notFound ? "ink" : "warn"}
      >
        {notFound ? <SearchX size={28} /> : <WifiOff size={28} />}
      </ThemeIcon>
      <Text size="lg" fw={700} c="navy.9" ta="center">
        {title}
      </Text>
      <Text size="sm" c="ink.6" ta="center" maw={420}>
        {description}
      </Text>
      <Group gap="sm" justify="center">
        <Button
          component={Link}
          href={back.href}
          variant="default"
          leftSection={<ArrowLeft size={16} aria-hidden="true" />}
        >
          {back.label}
        </Button>
        {!notFound && onRetry && (
          <Button
            onClick={onRetry}
            leftSection={<RotateCw size={16} aria-hidden="true" />}
          >
            {isVi ? "Thử lại" : "Try again"}
          </Button>
        )}
      </Group>
    </Stack>
  );
}
