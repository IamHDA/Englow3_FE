"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Alert, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import React from "react";
import { QuizQuestion } from "../../../types";

interface FillBlankQuestionProps {
  question: QuizQuestion;
  value?: string;
  onChange: (val: string) => void;
}

export function FillBlankQuestion({
  question,
  value = "",
  onChange,
}: FillBlankQuestionProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Stack gap="md">
      <Text fw={600} fz="md" c="dark.9" style={{ whiteSpace: "pre-line" }}>
        {question.prompt}
      </Text>

      <Card
        withBorder
        padding="lg"
        radius="md"
        bg="var(--mantine-color-gray-0)"
      >
        <Group align="center" gap="xs" wrap="wrap">
          {question.beforeText && (
            <Text fz="md" fw={600} c="dark.9">
              {question.beforeText}
            </Text>
          )}

          <TextInput
            placeholder={tr("Nhập từ...", "Type the word...")}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            style={{ width: 140 }}
            styles={{
              input: {
                textAlign: "center",
                fontWeight: 700,
                color: "var(--mantine-color-indigo-8)",
                borderColor: "var(--mantine-color-indigo-4)",
              },
            }}
          />

          {question.afterText && (
            <Text fz="md" fw={600} c="dark.9">
              {question.afterText}
            </Text>
          )}
        </Group>
      </Card>

      <Alert
        variant="light"
        color="blue"
        title={tr("Quy tắc chấm điểm", "How it is scored")}
        icon={<IconInfoCircle size={16} />}
      >
        {tr(
          "Hệ thống không phân biệt chữ hoa / chữ thường. Hãy kiểm tra kỹ chính tả trước khi chuyển sang câu tiếp theo.",
          "Upper and lower case count the same. Check the spelling before moving on.",
        )}
      </Alert>
    </Stack>
  );
}
