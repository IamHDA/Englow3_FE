"use client";

import React from "react";
import { Badge, Tabs } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { isExamAnswerPresent, type ExamAnswers } from "../../../examAnswers";
import { partLabel, type ExamPartEntry } from "../../../examParts";

export interface PartTabsProps {
  parts: readonly ExamPartEntry[];
  /** The key of the part on screen. */
  currentKey: string | null;
  answers: ExamAnswers;
  onSelectPart: (part: ExamPartEntry) => void;
}

/**
 * The parts of the paper, one tab each, with how many of a part's questions
 * are answered. Choosing one opens that part's page.
 */
export function PartTabs({
  parts,
  currentKey,
  answers,
  onSelectPart,
}: PartTabsProps) {
  const { t } = useLanguage();

  return (
    <Tabs
      value={currentKey}
      onChange={(key) => {
        const part = parts.find((entry) => entry.key === key);
        if (part) onSelectPart(part);
      }}
      variant="pills"
      radius="xl"
    >
      <Tabs.List aria-label={t.exam.partsLabel}>
        {parts.map((part) => {
          const name = partLabel(part, parts);
          const answered = part.questions.filter((question) =>
            isExamAnswerPresent(answers[question.questionId]),
          ).length;
          const total = part.questions.length;
          return (
            <Tabs.Tab
              key={part.key}
              value={part.key}
              aria-label={t.exam.partTabAria
                .replace("{part}", name)
                .replace("{answered}", String(answered))
                .replace("{total}", String(total))}
              rightSection={
                <Badge
                  size="sm"
                  radius="xl"
                  variant={part.key === currentKey ? "white" : "light"}
                  color={answered === total ? "green" : "gray"}
                >
                  {answered}/{total}
                </Badge>
              }
            >
              {name}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
}
