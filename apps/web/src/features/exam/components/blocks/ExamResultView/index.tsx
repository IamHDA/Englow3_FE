"use client";

import { ExamQuestionType } from "@/lib/graphql/generated/schemaTypes";
import React, { useState } from "react";
import Link from "next/link";
import {
  Accordion,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import type {
  AttemptQuestionReview,
  ExamAttemptResult,
  ExamPaper,
} from "../../../types";
import { ExamAttemptMode, ExamType } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { FlatQuestionItem } from "../QuestionPalette";
import { PlacementLevelCard, type PartScore } from "../PlacementLevelCard";
import classes from "./ExamResultView.module.css";

export interface ExamResultViewProps {
  paper: ExamPaper;
  questions: FlatQuestionItem[];
  /** Lượt thi đã chấm. Điểm, đáp án đúng và giải thích đều lấy từ đây. */
  attempt: ExamAttemptResult;
  onRetake: () => void;
  /** Sat for an IELTS full test: no retake, and the way back leads to the sitting. */
  fullTestBack?: { href: string; label: string } | null;
}

/**
 * Không chọn ô nào và không gõ chữ nào nghĩa là bỏ qua - backend vẫn ghi câu đó
 * với mảng rỗng.
 */
function isSkipped(review: AttemptQuestionReview | undefined): boolean {
  return (
    (review?.selectedOptionIds.length ?? 0) === 0 && !review?.textAnswer?.trim()
  );
}

export function ExamResultView({
  paper,
  questions,
  attempt,
  onRetake,
  fullTestBack = null,
}: ExamResultViewProps) {
  const { t, isVi } = useLanguage();
  const [filterTab, setFilterTab] = useState<string>("all");
  const isPractice = attempt.mode === ExamAttemptMode.PRACTICE;

  // Build a lookup map of all questions in paper
  const questionMap = new Map<
    string,
    {
      question: ExamPaper["sections"][number]["parts"][number]["questionSets"][number]["questions"][number];
      partTitle: string;
      sectionType: string;
      /** The list a MATCHING question chose from. */
      setOptions: ExamPaper["sections"][number]["parts"][number]["questionSets"][number]["setOptions"];
    }
  >();

  paper.sections.forEach((sec) => {
    sec.parts.forEach((part) => {
      part.questionSets.forEach((qs) => {
        qs.questions.forEach((q) => {
          questionMap.set(q.id, {
            question: q,
            partTitle: part.title,
            sectionType: sec.sectionType,
            setOptions: qs.setOptions,
          });
        });
      });
    });
  });

  // Chấm điểm là việc của backend - ở đây chỉ tra cứu lại kết quả nó trả về.
  const reviewMap = new Map(
    attempt.questions.map((review) => [review.questionId, review]),
  );

  const evaluatedQuestions = questions.map((item) => {
    const qData = questionMap.get(item.questionId);
    const q = qData?.question;
    const review = reviewMap.get(item.questionId);

    return {
      item,
      question: q,
      review,
      partTitle: qData?.partTitle || "",
      sectionType: qData?.sectionType || "",
      setOptions: qData?.setOptions ?? [],
      isAnswered: !isSkipped(review),
      isCorrect: review?.correct === true,
    };
  });

  const totalQuestions = attempt.questionCount;
  const correctCount = attempt.correctAnswerCount ?? 0;
  const skippedCount = evaluatedQuestions.filter((eq) => !eq.isAnswered).length;
  const incorrectCount = totalQuestions - correctCount - skippedCount;

  const accuracyPercent = Math.round(attempt.scorePercentage ?? 0);
  const bands = (attempt.sections ?? []).filter(
    (section) => section.band !== null && section.band !== undefined,
  );
  const scaledScore = attempt.convertedScore ?? attempt.rawScore ?? 0;
  const maxScore =
    attempt.convertedScore != null
      ? 990
      : (attempt.maxRawScore ?? paper.maxRawScore);
  const unconvertedToeic =
    paper.certificateType === "TOEIC" &&
    !isPractice &&
    attempt.convertedScore == null;

  // Thời gian làm bài đo bằng hai mốc của server, không bằng đồng hồ máy khách.
  const timeSpentSeconds = attempt.submittedAt
    ? Math.max(
        0,
        Math.round(
          (Date.parse(attempt.submittedAt) - Date.parse(attempt.startedAt)) /
            1000,
        ),
      )
    : 0;
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes} ${t.exam.minutesText} ${seconds.toString().padStart(2, "0")} ${t.exam.secondsText}`;

  const isPlacement = paper.examType === ExamType.PLACEMENT && !isPractice;
  // Right answers per part, in paper order, for the placement summary.
  const partScores = evaluatedQuestions.reduce<PartScore[]>((parts, eq) => {
    const title = eq.partTitle || eq.sectionType;
    let part = parts.find((p) => p.title === title);
    if (!part) {
      part = { title, correct: 0, total: 0 };
      parts.push(part);
    }
    part.total += 1;
    if (eq.isCorrect) part.correct += 1;
    return parts;
  }, []);

  const filteredQuestions = evaluatedQuestions.filter((eq) => {
    if (filterTab === "correct") return eq.isCorrect;
    if (filterTab === "incorrect") return eq.isAnswered && !eq.isCorrect;
    if (filterTab === "skipped") return !eq.isAnswered;
    return true;
  });

  return (
    <Box py="xl" px={{ base: "md", md: "xl" }} maw={1100} mx="auto">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Flex align="center" gap="xs">
          <Text
            component={Link}
            href="/exams"
            className={classes.breadcrumbLink}
          >
            <ArrowLeft size={16} />
            {t.exam.backToLibrary}
          </Text>
          <Text c="ink.3" size="sm">
            /
          </Text>
          <Text c="navy.9" size="sm" fw={600}>
            {t.exam.resultTitlePrefix} {paper.title}
          </Text>
        </Flex>

        {isPlacement && (
          <PlacementLevelCard
            attemptId={attempt.id}
            scorePercentage={attempt.scorePercentage ?? 0}
            parts={partScores}
          />
        )}

        {/* Hero Score Banner */}
        {unconvertedToeic && (
          <Alert color="orange">
            {isVi
              ? "Đây là điểm bài tập, chưa phải điểm TOEIC quy đổi. Chưa có bảng quy đổi phù hợp cho đề này; kết quả không dùng để xét mốc điểm lộ trình."
              : "These are exercise points, not a converted TOEIC score. No matching conversion table is available; this result cannot settle a roadmap score milestone."}
          </Alert>
        )}
        <Card
          radius="lg"
          p={{ base: "lg", md: "xl" }}
          withBorder
          className={classes.bannerCard}
        >
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Badge
                  color="navy"
                  variant="light"
                  size="lg"
                  radius="xl"
                  mb={4}
                >
                  {isPractice
                    ? isVi
                      ? "Luyện tập"
                      : "Practice"
                    : t.exam.finishedBadge}
                </Badge>
                <Title order={1} size="h2" c="navy.9" fw={700}>
                  {paper.title}
                </Title>
                {isPractice && (
                  <Text size="sm" c="ink.6">
                    {(isVi ? "Các part đã luyện: " : "Parts practised: ") +
                      attempt.parts
                        .map((part) => part.title)
                        .filter(Boolean)
                        .join(", ")}
                    {isVi
                      ? " · Không tính vào tiến độ và điểm cao nhất."
                      : " · Not counted toward progress or your best score."}
                  </Text>
                )}
              </Stack>

              {/* Action buttons */}
              <Group gap="xs">
                {!fullTestBack && (
                  <Button
                    variant="default"
                    radius="xl"
                    size="sm"
                    leftSection={<RotateCcw size={16} />}
                    onClick={onRetake}
                  >
                    {t.exam.retakeCTA}
                  </Button>
                )}
                <Button
                  component={Link}
                  href={fullTestBack?.href ?? "/exams"}
                  radius="xl"
                  size="sm"
                  className={classes.libraryBtn}
                >
                  {fullTestBack?.label ?? t.exam.backToLibrary}
                </Button>
              </Group>
            </Group>

            {/* Score Grid Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <Card p="md" radius="md" className={classes.scoreCardEstimated}>
                <Group gap="xs" mb={4}>
                  <Award size={20} color="var(--mantine-color-navy-9)" />
                  <Text size="xs" fw={700} c="navy.9">
                    {unconvertedToeic
                      ? isVi
                        ? "Điểm bài tập"
                        : "Exercise points"
                      : t.exam.estimatedScore}
                  </Text>
                </Group>
                <Text size="xl" fw={700} c="navy.9">
                  {scaledScore} / {maxScore}
                </Text>
                <Text size="xs" c="navy.7">
                  {t.exam.accuracyRate} {accuracyPercent}%
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardCorrect}>
                <Group gap="xs" mb={4}>
                  <CheckCircle2
                    size={20}
                    color="var(--mantine-color-green-6)"
                  />
                  <Text size="xs" fw={700} c="green.9">
                    {t.exam.correctAnswersCount}
                  </Text>
                </Group>
                <Text size="xl" fw={700} c="green.9">
                  {correctCount}
                </Text>
                <Text size="xs" c="green.7">
                  {t.exam.outOfTotal.replace("{total}", String(totalQuestions))}
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardIncorrect}>
                <Group gap="xs" mb={4}>
                  <XCircle size={20} color="var(--mantine-color-warn-6)" />
                  <Text size="xs" fw={700} c="warn.9">
                    {t.exam.incorrectAnswersCount}
                  </Text>
                </Group>
                <Text size="xl" fw={700} c="warn.9">
                  {incorrectCount}
                </Text>
                <Text size="xs" c="warn.7">
                  {t.exam.reviewNeeded}
                </Text>
              </Card>

              <Card p="md" radius="md" className={classes.scoreCardTime}>
                <Group gap="xs" mb={4}>
                  <Clock size={20} color="var(--mantine-color-ink-7)" />
                  <Text size="xs" fw={700} c="ink.7">
                    {t.exam.timeSpentLabel}
                  </Text>
                </Group>
                <Text size="md" fw={700} c="ink.9">
                  {timeFormatted}
                </Text>
                <Text size="xs" c="ink.5">
                  {t.exam.skippedCount.replace("{count}", String(skippedCount))}
                </Text>
              </Card>
            </SimpleGrid>

            {/* Estimated certificate band per section - IELTS Listening and
                Reading on a full sitting. The backend converts; we only show. */}
            {bands.length > 0 && (
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                {bands.map((section) => (
                  <Card key={section.sectionType} p="md" radius="md" withBorder>
                    <Text size="xs" c="ink.5" fw={600}>
                      {section.sectionType}
                    </Text>
                    <Text size="xl" fw={800} c="navy.9">
                      {isVi ? "Band " : "Band "}
                      {section.band?.toFixed(1)}
                    </Text>
                    <Text size="xs" c="ink.5">
                      {section.rawScore ?? 0} / {section.maxRawScore}
                      {isVi ? " · ước tính" : " · estimate"}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Card>

        {/* Detailed Answer Review Section */}
        <Card
          radius="lg"
          p={{ base: "md", md: "xl" }}
          withBorder
          className={classes.reviewCard}
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Title order={2} size="h3" c="navy.9" fw={700}>
                  {t.exam.explanationsTitle}
                </Title>
                <Text size="xs" c="ink.5">
                  {t.exam.explanationsDesc}
                </Text>
              </Stack>

              {/* Review Filter Tabs */}
              <Tabs
                value={filterTab}
                onChange={(val) => setFilterTab(val || "all")}
              >
                <Tabs.List>
                  <Tabs.Tab value="all">
                    {t.exam.tabAllReview} ({totalQuestions})
                  </Tabs.Tab>
                  <Tabs.Tab value="correct">
                    {t.exam.tabCorrect} ({correctCount})
                  </Tabs.Tab>
                  <Tabs.Tab value="incorrect">
                    {t.exam.tabIncorrect} ({incorrectCount})
                  </Tabs.Tab>
                  <Tabs.Tab value="skipped">
                    {t.exam.tabSkipped} ({skippedCount})
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Group>

            {/* Questions Review Accordion */}
            <Accordion variant="separated" radius="md">
              {filteredQuestions.map(
                ({
                  item,
                  question,
                  review,
                  partTitle,
                  isCorrect,
                  isAnswered,
                  setOptions,
                }) => {
                  if (!question) return null;
                  const typedQuestion =
                    question.questionType === ExamQuestionType.TEXT_ENTRY;
                  const choices =
                    question.questionType === ExamQuestionType.MATCHING
                      ? setOptions.map((entry) => ({
                          id: entry.id,
                          letter: entry.label,
                          content: entry.content ?? "",
                        }))
                      : question.options.map((option, index) => ({
                          id: option.id,
                          letter: String.fromCharCode(65 + index),
                          content: option.content,
                        }));

                  // Đáp án đúng và giải thích chỉ tồn tại trong kết quả chấm -
                  // đề người học nhận lúc làm bài đã bị gỡ hết.
                  const optionReview = new Map(
                    review?.options.map((o) => [o.optionId, o]) ?? [],
                  );
                  const correctExplanation = review?.options.find(
                    (o) => o.correct,
                  )?.explanation;

                  return (
                    <Accordion.Item
                      key={item.questionId}
                      value={item.questionId}
                    >
                      <Accordion.Control>
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm">
                            <ThemeIcon
                              size={26}
                              radius="xl"
                              color={
                                !isAnswered
                                  ? "gray.2"
                                  : isCorrect
                                    ? "teal.1"
                                    : "red.1"
                              }
                              c={
                                !isAnswered
                                  ? "ink.6"
                                  : isCorrect
                                    ? "teal.9"
                                    : "red.9"
                              }
                            >
                              <Text size="xs" fw={700}>
                                {item.label}
                              </Text>
                            </ThemeIcon>
                            <Stack gap={1}>
                              <Text size="sm" fw={600} c="navy.9" lineClamp={1}>
                                {question.content}
                              </Text>
                              <Text size="xs" c="ink.5">
                                {partTitle}
                              </Text>
                            </Stack>
                          </Group>

                          <Badge
                            color={
                              !isAnswered ? "gray" : isCorrect ? "green" : "red"
                            }
                            variant="light"
                            size="sm"
                            radius="xl"
                          >
                            {!isAnswered
                              ? t.exam.tabSkipped
                              : isCorrect
                                ? t.exam.tabCorrect
                                : t.exam.tabIncorrect}
                          </Badge>
                        </Group>
                      </Accordion.Control>

                      <Accordion.Panel>
                        <Stack gap="sm" pt="xs">
                          {typedQuestion && (
                            <Stack gap={4}>
                              <Text size="sm" c="ink.8">
                                {isVi ? "Bạn đã gõ: " : "You typed: "}
                                <Text
                                  component="span"
                                  fw={700}
                                  c={isCorrect ? "teal.9" : "red.9"}
                                >
                                  {review?.textAnswer?.trim() ||
                                    (isVi ? "(bỏ trống)" : "(blank)")}
                                </Text>
                              </Text>
                              <Text size="sm" c="ink.8">
                                {isVi
                                  ? "Đáp án được chấp nhận: "
                                  : "Accepted answers: "}
                                <Text component="span" fw={700} c="teal.9">
                                  {review?.acceptedAnswers.join(" / ")}
                                </Text>
                              </Text>
                            </Stack>
                          )}
                          {/* Options List */}
                          <Stack gap="xs">
                            {choices.map((opt) => {
                              const isUserChoice =
                                review?.selectedOptionIds.includes(opt.id) ===
                                true;
                              const isCorrectOpt =
                                optionReview.get(opt.id)?.correct === true;
                              const letter = opt.letter;

                              let bg = "white";
                              let badgeLabel: string | null = null;

                              if (isCorrectOpt) {
                                bg = "var(--mantine-color-green-0)";
                                badgeLabel = t.exam.correctBadge;
                              } else if (isUserChoice && !isCorrectOpt) {
                                bg = "var(--mantine-color-warn-0)";
                                badgeLabel = t.exam.yourChoiceBadge;
                              }

                              return (
                                <Paper
                                  key={opt.id}
                                  p="xs"
                                  radius="md"
                                  withBorder
                                  bg={bg}
                                >
                                  <Flex justify="space-between" align="center">
                                    <Group gap="sm">
                                      <ThemeIcon
                                        size={22}
                                        radius="xl"
                                        color={
                                          isCorrectOpt
                                            ? "teal.7"
                                            : isUserChoice
                                              ? "red.7"
                                              : "gray.2"
                                        }
                                        c={
                                          isCorrectOpt || isUserChoice
                                            ? "white"
                                            : "ink.7"
                                        }
                                      >
                                        <Text size="xs" fw={700}>
                                          {letter}
                                        </Text>
                                      </ThemeIcon>
                                      <Text size="sm" c="ink.8">
                                        {opt.content}
                                      </Text>
                                    </Group>

                                    {badgeLabel && (
                                      <Badge
                                        size="xs"
                                        color={isCorrectOpt ? "green" : "red"}
                                        variant="filled"
                                      >
                                        {badgeLabel}
                                      </Badge>
                                    )}
                                  </Flex>
                                </Paper>
                              );
                            })}
                          </Stack>

                          {review && (
                            <Button
                              component={Link}
                              href={`/ai-tutor?examAttempt=${encodeURIComponent(attempt.id)}&examQuestion=${encodeURIComponent(item.questionId)}`}
                              variant="light"
                              mih={44}
                            >
                              {isVi
                                ? "Nhờ Tutor giải thích câu này"
                                : "Ask Tutor to explain this question"}
                            </Button>
                          )}
                          {/* Explanation Note */}
                          {(review?.explanation || correctExplanation) && (
                            <Box p="sm" className={classes.explanationBox}>
                              <Text size="xs" fw={700} c="navy.9" mb={2}>
                                {t.exam.detailedExplanation}
                              </Text>
                              <Text
                                size="xs"
                                c="ink.7"
                                style={{ lineHeight: 1.5 }}
                              >
                                {review?.explanation || correctExplanation}
                              </Text>
                            </Box>
                          )}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                },
              )}
            </Accordion>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
