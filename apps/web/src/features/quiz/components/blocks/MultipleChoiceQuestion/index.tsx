"use client";

import {
  Badge,
  Card,
  Group,
  Radio,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import React from "react";
import { QuizQuestion } from "../../../types";

interface MultipleChoiceQuestionProps {
  question: QuizQuestion;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export function MultipleChoiceQuestion({
  question,
  selectedOptionId,
  onSelectOption,
}: MultipleChoiceQuestionProps) {
  return (
    <Stack gap="md">
      <Text fw={600} fz="md" c="dark.9" style={{ whiteSpace: "pre-line" }}>
        {question.prompt}
      </Text>

      <Stack gap="xs">
        {question.mcOptions?.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <UnstyledButton
              key={option.id}
              onClick={() => onSelectOption(option.id)}
            >
              <Card
                withBorder
                padding="md"
                radius="md"
                style={{
                  backgroundColor: isSelected
                    ? "var(--mantine-color-indigo-0)"
                    : "var(--mantine-color-body)",
                  borderColor: isSelected
                    ? "var(--mantine-color-indigo-6)"
                    : undefined,
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="md">
                    <Badge
                      variant={isSelected ? "filled" : "light"}
                      color={isSelected ? "indigo" : "gray"}
                      size="lg"
                      circle
                    >
                      {option.label}
                    </Badge>
                    <Text
                      fz="sm"
                      fw={isSelected ? 600 : 500}
                      c={isSelected ? "indigo.9" : "dark.8"}
                    >
                      {option.text}
                    </Text>
                  </Group>

                  <Radio
                    checked={isSelected}
                    onChange={() => onSelectOption(option.id)}
                    color="indigo"
                  />
                </Group>
              </Card>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Stack>
  );
}
