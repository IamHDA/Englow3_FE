"use client";
import {
  ActionIcon,
  Button,
  Group,
  Input,
  Stack,
  TextInput,
} from "@mantine/core";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { ExamSetOption } from "../../types/authoring";
import { MAX_SET_OPTION_LABEL_LENGTH } from "../../constants/examQuestionTypes";

/**
 * The list every matching question of a group chooses from - headings i-x,
 * people A-E, map letters. A label may be used by several questions.
 */
export function SetOptionsEditor({
  entries,
  change,
  error,
  disabled,
}: {
  entries: ExamSetOption[];
  change: (v: ExamSetOption[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { isVi } = useLanguage();
  const renumber = (list: ExamSetOption[]) =>
    list.map((entry, i) => ({ ...entry, orderNo: i + 1 }));
  return (
    <Input.Wrapper
      label={isVi ? "Danh sách để ghép (câu dạng ghép)" : "Matching list"}
      description={
        isVi
          ? "Chỉ cần khi nhóm có câu dạng ghép. Nhãn như i, ii, iii hoặc A, B, C."
          : "Only needed when the group has matching questions. Labels such as i, ii, iii or A, B, C."
      }
      error={error}
    >
      <Stack gap="xs" mt="xs">
        {entries.map((entry, i) => (
          <Group key={i} wrap="nowrap" align="center">
            <TextInput
              aria-label={`${isVi ? "Nhãn" : "Label"} ${i + 1}`}
              placeholder={isVi ? "Nhãn" : "Label"}
              value={entry.label}
              maxLength={MAX_SET_OPTION_LABEL_LENGTH}
              disabled={disabled}
              w={90}
              onChange={(e) => {
                const label = e.currentTarget.value;
                change(entries.map((v, j) => (j === i ? { ...v, label } : v)));
              }}
            />
            <TextInput
              aria-label={`${isVi ? "Nội dung mục" : "Entry text"} ${i + 1}`}
              placeholder={isVi ? "Nội dung (tùy chọn)" : "Text (optional)"}
              value={entry.content ?? ""}
              disabled={disabled}
              style={{ flex: 1 }}
              onChange={(e) => {
                const content = e.currentTarget.value;
                change(
                  entries.map((v, j) => (j === i ? { ...v, content } : v)),
                );
              }}
            />
            <ActionIcon
              variant="subtle"
              color="red"
              disabled={disabled}
              aria-label={isVi ? "Xóa mục" : "Remove entry"}
              onClick={() =>
                change(renumber(entries.filter((_, j) => j !== i)))
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
                  ...entries,
                  {
                    label: String.fromCharCode(65 + entries.length),
                    content: "",
                    orderNo: 0,
                  },
                ]),
              )
            }
          >
            {isVi ? "Thêm mục" : "Add entry"}
          </Button>
        </Group>
      </Stack>
    </Input.Wrapper>
  );
}
