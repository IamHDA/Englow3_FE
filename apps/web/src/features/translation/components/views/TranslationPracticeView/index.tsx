"use client";

import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, RotateCcw, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useSubmitTranslationMutation,
  useTranslationAttemptQuery,
  useTranslationSetQuery,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import { TranslationResultCard } from "../../blocks/TranslationResultCard";

/** Same ceiling as the backend's TranslationAttempt.MAX_RESPONSE_LENGTH. */
const MAX_LENGTH = 1000;
const POLL_MS = 2000;

/** What the screen says for each refusal the backend can give a submission. */
const SUBMIT_ERRORS: Record<string, { vi: string; en: string }> = {
  TRANSLATION_NOT_ENGLISH: {
    vi: "Bạn cần viết bản dịch bằng tiếng Anh.",
    en: "Write your translation in English.",
  },
  TRANSLATION_DAILY_LIMIT_REACHED: {
    vi: "Bạn đã dùng hết lượt chấm AI hôm nay. Hãy quay lại vào ngày mai.",
    en: "You have used today's AI grading allowance. Come back tomorrow.",
  },
  RATE_LIMITED: {
    vi: "Bạn đang nộp quá nhanh. Đợi một chút rồi thử lại.",
    en: "You are submitting too fast. Wait a moment and try again.",
  },
  AI_QUEUE_BUSY: {
    vi: "Hệ thống chấm đang bận. Thử lại sau ít phút.",
    en: "The grader is busy. Try again in a few minutes.",
  },
  TRANSLATION_RESPONSE_TOO_LONG: {
    vi: `Bản dịch dài tối đa ${MAX_LENGTH} ký tự.`,
    en: `A translation can be at most ${MAX_LENGTH} characters.`,
  },
};

export function TranslationPracticeView({ id }: { id: string }) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);

  const setQuery = useTranslationSetQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const items = useMemo(
    () => setQuery.data?.translationSet.items ?? [],
    [setQuery.data],
  );
  const set = setQuery.data?.translationSet.set;

  // Until the learner picks one, the first sentence without a grade.
  const [chosen, setIndex] = useState<number | null>(null);
  const firstUngraded = useMemo(() => {
    const next = items.findIndex(
      (item) => item.latestAttempt?.status !== "GRADED",
    );
    return next === -1 ? 0 : next;
  }, [items]);
  const index = items.length === 0 ? null : (chosen ?? firstUngraded);
  const current = index === null ? undefined : items[index];

  // The attempt shown under the sentence: one just submitted, else the last one made.
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});
  const attemptId = current
    ? (submitted[current.id] ?? current.latestAttempt?.id ?? null)
    : null;
  const showAttempt = Boolean(attemptId) && !(current && retrying[current.id]);

  const attemptQuery = useTranslationAttemptQuery({
    variables: { id: attemptId ?? "" },
    skip: !attemptId,
    fetchPolicy: "cache-and-network",
  });
  const attempt = attemptQuery.data?.translationAttempt;
  const waiting = attempt?.status === "QUEUED";
  const { startPolling, stopPolling } = attemptQuery;
  useEffect(() => {
    if (waiting) {
      startPolling(POLL_MS);
      return () => stopPolling();
    }
    stopPolling();
    return undefined;
  }, [waiting, startPolling, stopPolling]);

  // A grade that just landed moves the progress on the sentence list - once
  // per attempt and outcome, not on every render.
  const refetchSet = setQuery.refetch;
  const refreshedFor = useRef<string | null>(null);
  useEffect(() => {
    const settled =
      attempt && attempt.status !== "QUEUED"
        ? `${attempt.id}:${attempt.status}`
        : null;
    if (settled && refreshedFor.current !== settled) {
      refreshedFor.current = settled;
      void refetchSet().catch(() => {});
    }
  }, [attempt, refetchSet]);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = current ? (drafts[current.id] ?? "") : "";
  const [submit, submission] = useSubmitTranslationMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function send() {
    if (!current || !draft.trim() || submission.loading) return;
    setSubmitError(null);
    try {
      const result = await submit({
        variables: { itemId: current.id, response: draft },
      });
      const created = result.data?.submitTranslation;
      if (created) {
        setSubmitted((prev) => ({ ...prev, [current.id]: created.id }));
        setRetrying((prev) => ({ ...prev, [current.id]: false }));
      }
    } catch (error) {
      const known = SUBMIT_ERRORS[backendCodeOf(error) ?? ""];
      setSubmitError(
        known
          ? isVi
            ? known.vi
            : known.en
          : t(
              "Không nộp được bài. Kiểm tra kết nối rồi thử lại.",
              "Could not submit. Check your connection and try again.",
            ),
      );
    }
  }

  function goTo(next: number) {
    setSubmitError(null);
    setIndex(next);
  }

  if (setQuery.error && !set) {
    return (
      <Page>
        <LoadErrorState
          error={setQuery.error}
          thing={{ vi: "bộ câu luyện dịch", en: "translation set" }}
          back={{
            href: "/study/translation",
            label: t("Thư viện luyện dịch", "Translation library"),
          }}
          onRetry={() => void setQuery.refetch().catch(() => {})}
        />
      </Page>
    );
  }
  if (!set || !current || index === null) {
    return (
      <Page>
        <Loader />
      </Page>
    );
  }

  const isLast = index === items.length - 1;

  return (
    <Page>
      <Stack gap="lg">
        <div>
          <Anchor component={Link} href="/study/translation" size="sm">
            <Group gap={4}>
              <ArrowLeft size={14} aria-hidden />
              {t("Thư viện luyện dịch", "Translation library")}
            </Group>
          </Anchor>
          <Title order={1} mt="xs">
            {set.title}
          </Title>
          <Text c="dimmed">
            {t(
              `Đã dịch ${set.gradedCount}/${set.itemCount} câu`,
              `${set.gradedCount}/${set.itemCount} sentences translated`,
            )}
          </Text>
        </div>

        <Group
          gap={6}
          role="navigation"
          aria-label={t("Chọn câu", "Choose a sentence")}
        >
          {items.map((item, i) => {
            const score =
              item.latestAttempt?.status === "GRADED"
                ? item.latestAttempt.score
                : null;
            const color =
              score == null
                ? "gray"
                : score >= 85
                  ? "teal"
                  : score >= 65
                    ? "blue"
                    : score >= 40
                      ? "yellow"
                      : "red";
            return (
              <Button
                key={item.id}
                size="compact-sm"
                variant={i === index ? "filled" : "light"}
                color={i === index ? "navy" : color}
                onClick={() => goTo(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={t(
                  `Câu ${item.orderNo}`,
                  `Sentence ${item.orderNo}`,
                )}
              >
                {item.orderNo}
              </Button>
            );
          })}
        </Group>

        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Badge variant="light" color="navy">
                {t(
                  `Câu ${current.orderNo}/${items.length}`,
                  `Sentence ${current.orderNo} of ${items.length}`,
                )}
              </Badge>
            </Group>
            <Text size="xl" fw={600} lang="vi">
              {current.sourceVi}
            </Text>

            {showAttempt && attempt && attempt.itemId === current.id ? (
              waiting ? (
                <Group gap="sm">
                  <Loader size="sm" />
                  <Text c="dimmed">
                    {t(
                      "AI đang chấm bản dịch của bạn…",
                      "AI is grading your translation…",
                    )}
                  </Text>
                </Group>
              ) : (
                <Stack gap="sm">
                  <TranslationResultCard attempt={attempt} />
                  <Group justify="space-between">
                    <Button
                      variant="subtle"
                      leftSection={<RotateCcw size={16} aria-hidden />}
                      onClick={() => {
                        setRetrying((prev) => ({
                          ...prev,
                          [current.id]: true,
                        }));
                        setDrafts((prev) => ({
                          ...prev,
                          [current.id]: attempt.response,
                        }));
                      }}
                    >
                      {t("Dịch lại câu này", "Try this one again")}
                    </Button>
                    {!isLast && (
                      <Button
                        rightSection={<ArrowRight size={16} aria-hidden />}
                        onClick={() => goTo(index + 1)}
                      >
                        {t("Câu tiếp theo", "Next sentence")}
                      </Button>
                    )}
                  </Group>
                </Stack>
              )
            ) : showAttempt && attemptQuery.loading ? (
              <Loader size="sm" />
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <Stack gap="sm">
                  <Textarea
                    label={t(
                      "Bản dịch tiếng Anh của bạn",
                      "Your English translation",
                    )}
                    placeholder={t(
                      "Gõ câu tiếng Anh…",
                      "Type the English sentence…",
                    )}
                    autosize
                    minRows={3}
                    maxLength={MAX_LENGTH}
                    lang="en"
                    spellCheck={false}
                    value={draft}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setDrafts((prev) => ({ ...prev, [current.id]: value }));
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                      ) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                  />
                  {submitError && (
                    <Alert color="red" variant="light">
                      {submitError}
                    </Alert>
                  )}
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {t("Ctrl + Enter để nộp", "Ctrl + Enter to submit")}
                    </Text>
                    <Button
                      type="submit"
                      color="orange"
                      loading={submission.loading}
                      disabled={!draft.trim()}
                      leftSection={<Send size={16} aria-hidden />}
                    >
                      {t("Nộp để chấm", "Submit for grading")}
                    </Button>
                  </Group>
                </Stack>
              </form>
            )}
          </Stack>
        </Card>

        <Group justify="space-between">
          <Button
            variant="default"
            disabled={index === 0}
            leftSection={<ArrowLeft size={16} aria-hidden />}
            onClick={() => goTo(index - 1)}
          >
            {t("Câu trước", "Previous")}
          </Button>
          <Button
            variant="default"
            disabled={isLast}
            rightSection={<ArrowRight size={16} aria-hidden />}
            onClick={() => goTo(index + 1)}
          >
            {t("Câu sau", "Next")}
          </Button>
        </Group>
      </Stack>
    </Page>
  );
}
