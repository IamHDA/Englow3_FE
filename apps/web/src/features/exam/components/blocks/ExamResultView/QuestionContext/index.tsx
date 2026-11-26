"use client";

import React from "react";
import { Image, Paper, Spoiler, Stack, Text } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";
import type { ExamPaper } from "../../../../types";
import { GapText } from "../../../parts/GapText";

type Part = ExamPaper["sections"][number]["parts"][number];
type QuestionSet = Part["questionSets"][number];

export interface QuestionContextProps {
  part: Part;
  questionSet: QuestionSet;
  /** The question reviewed: its gap stands out in the passage. */
  questionId: string;
  /** What was typed into each gap of the set, by question id. */
  typedAnswers: Record<string, string>;
}

/** A long passage starts folded, so the answer below is still in reach. */
const FOLDED_HEIGHT = 160;

/**
 * What a reviewed question was about, as it was shown in the test: the part's
 * and the set's instructions, passage, picture and recording. The attempt is
 * over, so a recording here plays with every control and as often as wanted.
 * Nothing when the question had no material of its own (TOEIC Part 5).
 */
export function QuestionContext({
  part,
  questionSet,
  questionId,
  typedAnswers,
}: QuestionContextProps) {
  const { isVi } = useLanguage();
  const showMore = isVi ? "Xem thêm" : "Show more";
  const showLess = isVi ? "Thu gọn" : "Show less";

  const hasPart = Boolean(part.content || part.audioUrl || part.imageUrl);
  const hasSet = Boolean(
    questionSet.content ||
    questionSet.audioUrl ||
    questionSet.imageUrl ||
    questionSet.instruction ||
    questionSet.title,
  );
  if (!hasPart && !hasSet) return null;

  return (
    <Paper withBorder radius="md" p="sm" bg="ink.0">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="ink.6">
          {isVi ? "Ngữ liệu của câu" : "What the question is about"}
        </Text>
        {part.instruction && (
          <Text size="xs" c="ink.6" fs="italic">
            {part.instruction}
          </Text>
        )}
        {part.audioUrl && (
          <audio
            controls
            preload="none"
            src={part.audioUrl}
            aria-label={isVi ? "Audio của phần thi" : "Part recording"}
            style={{ width: "100%" }}
          />
        )}
        {part.imageUrl && (
          <Image
            src={part.imageUrl}
            alt={isVi ? "Ảnh trong phần thi" : "Part stimulus"}
            fit="contain"
            mah={320}
          />
        )}
        {part.content && (
          <Spoiler
            maxHeight={FOLDED_HEIGHT}
            showLabel={showMore}
            hideLabel={showLess}
          >
            <Text size="sm" c="ink.8" style={{ whiteSpace: "pre-wrap" }}>
              {part.content}
            </Text>
          </Spoiler>
        )}
        {questionSet.title && (
          <Text size="sm" fw={700} c="navy.9">
            {questionSet.title}
          </Text>
        )}
        {questionSet.instruction && (
          <Text size="xs" c="ink.6" fs="italic">
            {questionSet.instruction}
          </Text>
        )}
        {questionSet.audioUrl && (
          <audio
            controls
            preload="none"
            src={questionSet.audioUrl}
            aria-label={isVi ? "Audio của nhóm câu" : "Recording of the set"}
            style={{ width: "100%" }}
          />
        )}
        {questionSet.imageUrl && (
          <Image
            src={questionSet.imageUrl}
            alt={isVi ? "Ảnh trong nhóm câu" : "Question stimulus"}
            fit="contain"
            mah={320}
          />
        )}
        {questionSet.content && (
          <Spoiler
            maxHeight={FOLDED_HEIGHT}
            showLabel={showMore}
            hideLabel={showLess}
          >
            <GapText
              content={questionSet.content}
              questions={questionSet.questions}
              typedAnswers={typedAnswers}
              currentQuestionId={questionId}
            />
          </Spoiler>
        )}
      </Stack>
    </Paper>
  );
}
