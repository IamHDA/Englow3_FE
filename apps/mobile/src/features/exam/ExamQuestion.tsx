import { Image, View } from "react-native";

import { ExamQuestionType } from "@/lib/graphql/generated";
import { ClipPlayer } from "@/ui/audio";
import { AppText, Choice, TextField } from "@/ui/components";
import { radius, spacing } from "@/ui/theme";

import {
  isTyped,
  MAX_TEXT_ANSWER_LENGTH,
  questionNumberLabel,
  type ExamAnswer,
  type ExamAnswers,
  type PaperQuestion,
  type PaperSet,
} from "./answers";

const GAP = /\{\{(\d+)\}\}/g;

/** A passage, transcript or note-completion text, with each `{{n}}` gap showing what was typed for question n. */
export function GapText({
  content,
  set,
  answers,
}: {
  content: string;
  set: PaperSet;
  answers: ExamAnswers;
}) {
  const byNumber = new Map(
    set.questions.map((question) => [question.numberFrom, question]),
  );
  const pieces: React.ReactNode[] = [];
  let last = 0;
  for (const match of content.matchAll(GAP)) {
    const start = match.index ?? 0;
    pieces.push(content.slice(last, start));
    const question = byNumber.get(Number(match[1]));
    const answer = question ? answers[question.id] : undefined;
    pieces.push(
      <AppText key={start} tone="primary" variant="label">
        ({match[1]}){" "}
        {isTyped(answer) && answer.text.trim() ? answer.text : "______"}
      </AppText>,
    );
    last = start + match[0].length;
  }
  pieces.push(content.slice(last));
  return (
    <AppText selectable style={{ lineHeight: 26 }}>
      {pieces}
    </AppText>
  );
}

export function Stimulus({
  content,
  audioUrl,
  imageUrl,
  set,
  answers,
}: {
  content?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
  set?: PaperSet;
  answers?: ExamAnswers;
}) {
  if (!content && !audioUrl && !imageUrl) return null;
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      {audioUrl ? <ClipPlayer url={audioUrl} /> : null}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: radius.md }}
          resizeMode="contain"
          accessibilityLabel="Hình minh hoạ của đề"
        />
      ) : null}
      {content ? (
        set && answers ? (
          <GapText content={content} set={set} answers={answers} />
        ) : (
          <AppText selectable style={{ lineHeight: 24 }}>
            {content}
          </AppText>
        )
      ) : null}
    </View>
  );
}

export function ExamQuestion({
  question,
  set,
  answer,
  onChange,
  disabled,
}: {
  question: PaperQuestion;
  set: PaperSet;
  answer: ExamAnswer | undefined;
  onChange: (answer: ExamAnswer | undefined) => void;
  disabled?: boolean;
}) {
  const multiple = question.questionType === ExamQuestionType.MULTIPLE_CHOICE;
  const choices =
    question.questionType === ExamQuestionType.MATCHING
      ? [...set.setOptions]
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((entry) => ({
            id: entry.id,
            letter: entry.label,
            content: entry.content ?? "",
          }))
      : [...question.options]
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((option, index) => ({
            id: option.id,
            letter: String.fromCharCode(65 + index),
            content: option.content,
          }));
  const selected =
    answer === undefined || isTyped(answer)
      ? []
      : Array.isArray(answer)
        ? answer
        : [answer];

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        {questionNumberLabel(question)}. {question.content}
      </AppText>
      {multiple && question.choiceLimit ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginBottom: spacing.xs }}
        >
          Chọn {question.choiceLimit} đáp án.
        </AppText>
      ) : null}
      {question.questionType === ExamQuestionType.TEXT_ENTRY ? (
        <TextField
          value={isTyped(answer) ? answer.text : ""}
          onChangeText={(text) => onChange(text ? { text } : undefined)}
          placeholder="Điền đáp án"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={MAX_TEXT_ANSWER_LENGTH}
          editable={!disabled}
          accessibilityLabel={`Câu ${questionNumberLabel(question)}`}
        />
      ) : (
        choices.map((choice) => {
          const isSelected = selected.includes(choice.id);
          return (
            <Choice
              key={choice.id}
              label={`${choice.letter}. ${choice.content}`}
              selected={isSelected}
              onPress={
                disabled
                  ? undefined
                  : () => {
                      if (!multiple)
                        onChange(isSelected ? undefined : choice.id);
                      else {
                        const next = isSelected
                          ? selected.filter((id) => id !== choice.id)
                          : [...selected, choice.id];
                        if (
                          question.choiceLimit &&
                          next.length > question.choiceLimit
                        )
                          return;
                        onChange(next.length ? next : undefined);
                      }
                    }
              }
            />
          );
        })
      )}
    </View>
  );
}
