"use client";
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Input,
  Stack,
  TextInput,
} from "@mantine/core";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { ExamAcceptedAnswer } from "../../types/authoring";
import { MAX_ACCEPTED_ANSWER_LENGTH } from "../../constants/examQuestionTypes";

/** Every spelling a gap accepts; capitals and spaces are folded unless ticked. */
export function AcceptedAnswersEditor({
  answers,
  change,
  error,
  disabled,
}: {
  answers: ExamAcceptedAnswer[];
  change: (v: ExamAcceptedAnswer[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { isVi } = useLanguage();
  const renumber = (list: ExamAcceptedAnswer[]) =>
    list.map((a, i) => ({ ...a, orderNo: i + 1 }));
  return (
    <Input.Wrapper
      label={isVi ? "Đáp án được chấp nhận" : "Accepted answers"}
      description={
        isVi
          ? 'Liệt kê mọi cách viết đúng (ví dụ: 7, seven). Không phân biệt hoa thường và khoảng trắng thừa, trừ khi chọn "Phân biệt hoa thường".'
          : 'List every correct spelling (e.g. 7, seven). Capitals and extra spaces are ignored unless "Case sensitive" is ticked.'
      }
      error={error}
      required
    >
      <Stack gap="xs" mt="xs">
        {answers.map((a, i) => (
          <Group key={i} wrap="nowrap" align="center">
            <TextInput
              aria-label={`${isVi ? "Đáp án" : "Answer"} ${i + 1}`}
              value={a.text}
              maxLength={MAX_ACCEPTED_ANSWER_LENGTH}
              disabled={disabled}
              style={{ flex: 1 }}
              onChange={(e) => {
                const text = e.currentTarget.value;
                change(answers.map((v, j) => (j === i ? { ...v, text } : v)));
              }}
            />
            <Checkbox
              label={isVi ? "Phân biệt hoa thường" : "Case sensitive"}
              checked={a.caseSensitive}
              disabled={disabled}
              onChange={(e) => {
                const caseSensitive = e.currentTarget.checked;
                change(
                  answers.map((v, j) =>
                    j === i ? { ...v, caseSensitive } : v,
                  ),
                );
              }}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              disabled={disabled}
              aria-label={isVi ? "Xóa đáp án" : "Remove answer"}
              onClick={() =>
                change(renumber(answers.filter((_, j) => j !== i)))
              }
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<Plus size={14} />}
            disabled={disabled}
            onClick={() =>
              change(
                renumber([
                  ...answers,
                  { text: "", caseSensitive: false, orderNo: 0 },
                ]),
              )
            }
          >
            {isVi ? "Thêm cách viết" : "Add spelling"}
          </Button>
        </Group>
      </Stack>
    </Input.Wrapper>
  );
}
