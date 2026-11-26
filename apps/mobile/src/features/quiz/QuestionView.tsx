import { Pressable, StyleSheet, View } from "react-native";

import { QuizQuestionType } from "@/lib/graphql/generated";
import { AppText, Button, Choice, Row, TextField } from "@/ui/components";
import { colors, radius, spacing } from "@/ui/theme";

import type { PaperQuestion, QuizAnswer } from "./answerEncoding";

type Props = {
  question: PaperQuestion;
  answer: QuizAnswer;
  onChange: (answer: QuizAnswer) => void;
  disabled?: boolean;
};

/** Renders any quiz question type and reports the learner's choice. */
export function QuestionView({ question, answer, onChange, disabled }: Props) {
  return (
    <View>
      {question.title ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginBottom: spacing.xs }}
        >
          {question.title}
        </AppText>
      ) : null}
      {question.prompt ? (
        <AppText variant="label" style={{ marginBottom: spacing.md }}>
          {question.prompt}
        </AppText>
      ) : null}
      <Body
        question={question}
        answer={answer}
        onChange={onChange}
        disabled={disabled}
      />
    </View>
  );
}

function Body({ question, answer, onChange, disabled }: Props) {
  switch (question.questionType) {
    case QuizQuestionType.MULTIPLE_CHOICE:
      return (
        <>
          {[...question.options]
            .sort((a, b) => a.orderNo - b.orderNo)
            .map((option) => (
              <Choice
                key={option.id}
                label={`${option.label}. ${option.content}`}
                selected={answer === option.id}
                onPress={disabled ? undefined : () => onChange(option.id)}
              />
            ))}
        </>
      );

    case QuizQuestionType.FILL_BLANK:
      return (
        <>
          {question.beforeText || question.afterText ? (
            <AppText style={{ marginBottom: spacing.sm }}>
              {question.beforeText} <AppText tone="primary">_____</AppText>{" "}
              {question.afterText}
            </AppText>
          ) : null}
          <TextField
            value={typeof answer === "string" ? answer : ""}
            onChangeText={(text) => onChange(text)}
            placeholder="Điền vào chỗ trống"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!disabled}
          />
        </>
      );

    case QuizQuestionType.REORDER:
    case QuizQuestionType.REWRITE: {
      const picked = Array.isArray(answer) ? answer : [];
      const pool =
        question.questionType === QuizQuestionType.REORDER
          ? question.scrambledWords
          : question.wordBank;
      // Words can repeat; track which pool positions are used, not which strings.
      const remaining = remainingIndexes(pool, picked);
      return (
        <>
          {question.questionType === QuizQuestionType.REWRITE &&
          question.originalSentence ? (
            <View style={styles.original}>
              <AppText style={{ fontStyle: "italic" }}>
                “{question.originalSentence}”
              </AppText>
              {question.rewriteKeyword ? (
                <AppText variant="caption" tone="primary">
                  Dùng từ: {question.rewriteKeyword}
                </AppText>
              ) : null}
            </View>
          ) : null}
          <View style={styles.answerBox}>
            {picked.length === 0 ? (
              <AppText tone="faint">Chạm vào từ bên dưới để ghép câu</AppText>
            ) : (
              <Row wrap gap={spacing.xs}>
                {picked.map((word, index) => (
                  <WordTile
                    key={`${word}-${index}`}
                    word={word}
                    active
                    onPress={
                      disabled
                        ? undefined
                        : () => onChange(picked.filter((_, i) => i !== index))
                    }
                  />
                ))}
              </Row>
            )}
          </View>
          <Row wrap gap={spacing.xs}>
            {remaining.map((poolIndex) => (
              <WordTile
                key={poolIndex}
                word={pool[poolIndex] ?? ""}
                onPress={
                  disabled
                    ? undefined
                    : () => onChange([...picked, pool[poolIndex] ?? ""])
                }
              />
            ))}
          </Row>
          {picked.length > 0 && !disabled ? (
            <Button
              title="Xoá hết"
              variant="ghost"
              size="sm"
              onPress={() => onChange([])}
            />
          ) : null}
        </>
      );
    }

    case QuizQuestionType.MATCHING: {
      const chosen =
        typeof answer === "object" && answer !== null && !Array.isArray(answer)
          ? answer
          : {};
      const used = new Set(Object.values(chosen));
      return (
        <>
          <AppText
            variant="caption"
            tone="muted"
            style={{ marginBottom: spacing.sm }}
          >
            Với mỗi dòng bên trái, chọn vế phù hợp bên dưới.
          </AppText>
          {question.leftTexts.map((left) => (
            <View key={left} style={styles.pair}>
              <AppText variant="label">{left}</AppText>
              <Row wrap gap={spacing.xs} style={{ marginTop: spacing.xs }}>
                {question.rightTexts.map((right) => {
                  const selected = chosen[left] === right;
                  return (
                    <WordTile
                      key={right}
                      word={right}
                      active={selected}
                      muted={!selected && used.has(right)}
                      onPress={
                        disabled
                          ? undefined
                          : () => {
                              const next = { ...chosen };
                              // A right half belongs to one left at a time.
                              for (const key of Object.keys(next))
                                if (next[key] === right) delete next[key];
                              if (!selected) next[left] = right;
                              onChange(next);
                            }
                      }
                    />
                  );
                })}
              </Row>
            </View>
          ))}
        </>
      );
    }

    default:
      return null;
  }
}

function remainingIndexes(pool: string[], picked: string[]): number[] {
  const left = [...picked];
  const result: number[] = [];
  pool.forEach((word, index) => {
    const at = left.indexOf(word);
    if (at >= 0) left.splice(at, 1);
    else result.push(index);
  });
  return result;
}

function WordTile({
  word,
  active,
  muted,
  onPress,
}: {
  word: string;
  active?: boolean;
  muted?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.tile,
        active && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        muted && { opacity: 0.4 },
      ]}
    >
      <AppText tone={active ? "inverse" : "default"}>{word}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  original: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  answerBox: {
    minHeight: 56,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: "center",
  },
  tile: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  pair: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
});
