import React from "react";
import { Text } from "@mantine/core";
import { gapTargets, questionNumberLabel } from "../../../../examAnswers";
import classes from "../QuestionCard.module.css";

/** A gap is written {{n}}: the set's n-th question, in orderNo order. */
const GAP = /\{\{(\d+)\}\}/g;

export interface GapTextProps {
  content: string;
  questions: readonly {
    id: string;
    orderNo: number;
    numberFrom: number;
    numberTo: number;
  }[];
  /** What has been typed so far, by question id. */
  typedAnswers: Record<string, string>;
  currentQuestionId: string;
}

/**
 * A passage, note or form with its gaps in place: each shows its question's
 * number and what was typed into it, and the one being answered stands out.
 * Read-only - the answer is typed in the field below, one question at a time.
 */
export function GapText({
  content,
  questions,
  typedAnswers,
  currentQuestionId,
}: GapTextProps) {
  const byOrder = gapTargets(questions);
  const pieces: React.ReactNode[] = [];
  let last = 0;
  for (const match of content.matchAll(GAP)) {
    const start = match.index ?? 0;
    pieces.push(content.slice(last, start));
    const question = byOrder.get(Number(match[1]));
    if (question) {
      const typed = typedAnswers[question.id];
      const current = question.id === currentQuestionId;
      pieces.push(
        <Text
          key={`${start}-${question.id}`}
          component="span"
          className={current ? classes.gapCurrent : classes.gap}
          aria-current={current ? "true" : undefined}
        >
          <Text component="span" fw={700} size="xs">
            {questionNumberLabel(question)}
          </Text>{" "}
          {typed?.trim() ? typed : "______"}
        </Text>,
      );
    } else {
      pieces.push(match[0]);
    }
    last = start + match[0].length;
  }
  pieces.push(content.slice(last));
  return (
    <Text
      size="sm"
      c="ink.8"
      style={{ whiteSpace: "pre-line", lineHeight: 1.9 }}
    >
      {pieces}
    </Text>
  );
}
