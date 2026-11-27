"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, Headphones, Volume2 } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import type { ExamPaper } from "../../../types";
import {
  questionNumberLabel,
  typedAnswerText,
  type ExamAnswers,
} from "../../../examAnswers";
import { PART_SHEET_ANCHOR_ID } from "../../../constants/examSitting";
import { QuestionCard } from "../QuestionCard";
import { GapText } from "../../parts/GapText";
import { StimulusAudio } from "./StimulusAudio";
import classes from "./PartSheet.module.css";

type Section = ExamPaper["sections"][number];
type Part = Section["parts"][number];

export interface PartSheetProps {
  section: Section;
  part: Part;
  answers: ExamAnswers;
  flaggedIds: ReadonlySet<string>;
  /** The question the learner is on, or null before they touch one. */
  currentQuestionId: string | null;
  /** Stable across renders (the sitting's useCallback): each question is
   *  memoised, and a new function would render all of them on every keystroke. */
  onSelectOption: (questionId: string, optionId: string) => void;
  onChangeText: (questionId: string, text: string) => void;
  onToggleFlag: (questionId: string) => void;
  /**
   * A real test: each clip is heard once. The attempt id is where what was
   * heard is remembered; left out, it is practice and the players are ordinary.
   */
  audioOnceForAttempt?: string;
  /**
   * The learner went on to this part (Next part, or the start of the test)
   * rather than jumping to it: its first clip starts by itself. Read when the
   * sheet is mounted - the parent mounts one sheet per part.
   */
  autoPlayFirstClip: boolean;
  onPrevPart: () => void;
  onNextPart: () => void;
  hasPrevPart: boolean;
  hasNextPart: boolean;
}

/**
 * A whole part on one page, as the computer-based test shows it: the part's
 * instructions and what it is about (a passage, a recording, a picture), then
 * each question set with its own material followed by its questions.
 *
 * The clips on the page play in order: once one ends, the next one starts.
 * The first starts by itself only when the learner went on to this part, so
 * looking at a part ahead of time does not use up a clip heard once.
 */
export function PartSheet({
  section,
  part,
  answers,
  flaggedIds,
  currentQuestionId,
  onSelectOption,
  onChangeText,
  onToggleFlag,
  audioOnceForAttempt,
  autoPlayFirstClip,
  onPrevPart,
  onNextPart,
  hasPrevPart,
  hasNextPart,
}: PartSheetProps) {
  const { t, isVi } = useLanguage();
  const isListening = section.sectionType.toUpperCase().includes("LISTEN");

  // The clips of the page in the order they are heard: the part's, then each set's.
  const clipIds = [
    ...(part.audioUrl ? [`part-${part.id}`] : []),
    ...part.questionSets
      .filter((set) => set.audioUrl)
      .map((set) => `set-${set.id}`),
  ];
  const [autoClip, setAutoClip] = useState<string | null>(
    autoPlayFirstClip ? (clipIds[0] ?? null) : null,
  );
  const playNextAfter = (clipId: string) => {
    const next = clipIds[clipIds.indexOf(clipId) + 1];
    if (next) setAutoClip(next);
  };
  const audioFor = (clipId: string, src: string) => (
    <StimulusAudio
      src={src}
      audioId={clipId}
      label={t.exam.audioStimulus}
      onceForAttempt={audioOnceForAttempt}
      autoPlay={autoClip === clipId}
      onEnded={() => playNextAfter(clipId)}
    />
  );

  return (
    <Card
      id={PART_SHEET_ANCHOR_ID}
      radius="lg"
      p={{ base: "md", md: "xl" }}
      withBorder
      className={classes.sheetRoot}
    >
      <Stack gap="lg">
        <Box p="sm" className={classes.partHeader}>
          <Group justify="space-between" align="center" mb={4}>
            <Text fw={700} size="sm" c="navy.9">
              {part.title}
            </Text>
            {isListening && (
              <Group gap={4}>
                <Headphones size={14} color="var(--mantine-color-navy-9)" />
                <Text size="xs" fw={600} c="navy.9">
                  {t.exam.listeningSection}
                </Text>
              </Group>
            )}
          </Group>
          {part.instruction && (
            <Text size="xs" c="ink.6" style={{ fontStyle: "italic" }}>
              {part.instruction}
            </Text>
          )}
        </Box>

        {(part.content || part.audioUrl || part.imageUrl) && (
          <Card withBorder>
            <Stack>
              {part.content && (
                <Text style={{ whiteSpace: "pre-wrap" }}>{part.content}</Text>
              )}
              {part.audioUrl && audioFor(`part-${part.id}`, part.audioUrl)}
              {part.imageUrl && (
                <Image
                  src={part.imageUrl}
                  alt={isVi ? "Ảnh trong phần thi" : "Part stimulus"}
                  fit="contain"
                  mah={360}
                />
              )}
            </Stack>
          </Card>
        )}

        {part.questionSets.map((questionSet) => (
          <Stack key={questionSet.id} gap="md">
            {(questionSet.content ||
              questionSet.audioUrl ||
              questionSet.imageUrl ||
              questionSet.instruction ||
              questionSet.title) && (
              <Card p="md" radius="md" className={classes.stimulusCard}>
                {/* Which questions this material is for - "Câu 32–34" - so a
                    recording shared by a set is never read as one question's. A set of
                    one question already says so on the question itself. */}
                {questionSet.questions.length > 1 && (
                  <Text size="xs" fw={700} c="ink.6" mb={4}>
                    {t.exam.questionsRange.replace(
                      "{range}",
                      questionNumberLabel({
                        numberFrom: questionSet.questions[0].numberFrom,
                        numberTo: questionSet.questions.at(-1)!.numberTo,
                      }),
                    )}
                  </Text>
                )}
                {questionSet.title && (
                  <Text fw={700} size="sm" c="navy.9" mb={4}>
                    {questionSet.title}
                  </Text>
                )}
                {questionSet.instruction && (
                  <Text
                    size="xs"
                    c="ink.5"
                    mb="xs"
                    style={{ fontStyle: "italic" }}
                  >
                    {questionSet.instruction}
                  </Text>
                )}
                {questionSet.content && (
                  <GapText
                    content={questionSet.content}
                    questions={questionSet.questions ?? []}
                    typedAnswers={Object.fromEntries(
                      questionSet.questions.map((question) => [
                        question.id,
                        typedAnswerText(answers[question.id]),
                      ]),
                    )}
                    currentQuestionId={currentQuestionId ?? ""}
                  />
                )}
                {questionSet.imageUrl && (
                  <Image
                    src={questionSet.imageUrl}
                    alt={isVi ? "Ảnh trong nhóm câu" : "Question stimulus"}
                    fit="contain"
                    mah={360}
                  />
                )}
                {/* URL đã được backend ký sẵn và tự hết hạn, phát thẳng được. */}
                {questionSet.audioUrl && (
                  <Box mt="xs" p="xs" className={classes.audioWidget}>
                    <Group gap="xs" mb={6}>
                      <Volume2 size={18} color="var(--mantine-color-navy-9)" />
                      <Text size="xs" fw={600} c="navy.9">
                        {t.exam.audioStimulus}
                      </Text>
                    </Group>
                    {audioFor(`set-${questionSet.id}`, questionSet.audioUrl)}
                  </Box>
                )}
              </Card>
            )}

            {questionSet.questions.map((question) => (
              <QuestionCard
                key={question.id}
                questionSet={questionSet}
                question={question}
                answer={answers[question.id]}
                isFlagged={flaggedIds.has(question.id)}
                isCurrent={question.id === currentQuestionId}
                onSelectOption={onSelectOption}
                onChangeText={onChangeText}
                onToggleFlag={onToggleFlag}
              />
            ))}
          </Stack>
        ))}

        <Divider color="gray.2" />

        <Group justify="space-between">
          <Button
            variant="default"
            radius="xl"
            size="sm"
            leftSection={<ArrowLeft size={16} />}
            onClick={onPrevPart}
            disabled={!hasPrevPart}
          >
            {t.exam.prevPart}
          </Button>
          <Button
            radius="xl"
            size="sm"
            rightSection={<ArrowRight size={16} />}
            onClick={onNextPart}
            disabled={!hasNextPart}
            className={classes.nextBtn}
          >
            {t.exam.nextPart}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
