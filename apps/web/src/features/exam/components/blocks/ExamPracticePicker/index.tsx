"use client";

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { Play } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import type { ExamOutlineSection } from "../../../types";

const SECTION_LABELS: Record<string, { vi: string; en: string }> = {
  LISTENING: { vi: "Nghe (Listening)", en: "Listening" },
  READING: { vi: "Đọc (Reading)", en: "Reading" },
  WRITING: { vi: "Viết (Writing)", en: "Writing" },
  SPEAKING: { vi: "Nói (Speaking)", en: "Speaking" },
};

/** Giới hạn giờ cho bài luyện tập, tính bằng phút. Rỗng là không giới hạn. */
const TIME_LIMIT_MINUTES = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const NO_LIMIT = "none";

export interface ExamPracticePickerProps {
  sections: ExamOutlineSection[] | null;
  loading: boolean;
  failed: boolean;
  starting: boolean;
  onRetry: () => void;
  onStart: (partIds: string[], timeLimitMinutes: number | null) => void;
}

/**
 * Chọn part để luyện tập, kiểu Study4: tích từng part (hoặc cả kỹ năng), chọn
 * giờ hoặc để không giới hạn. Part chưa có câu nào bị khoá - chọn nó chỉ dẫn
 * tới một bài trống.
 */
export function ExamPracticePicker({
  sections,
  loading,
  failed,
  starting,
  onRetry,
  onStart,
}: ExamPracticePickerProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState<string>(NO_LIMIT);

  if (loading) {
    return <Skeleton height={180} radius="md" />;
  }
  if (failed || !sections) {
    return (
      <Alert
        color="warn"
        title={tr("Không tải được danh sách part", "Could not load the parts")}
      >
        <Group gap="xs">
          <Text size="sm">
            {tr(
              "Kiểm tra kết nối rồi thử lại.",
              "Check the connection and try again.",
            )}
          </Text>
          <Button size="xs" variant="subtle" onClick={onRetry}>
            {tr("Thử lại", "Try again")}
          </Button>
        </Group>
      </Alert>
    );
  }

  const usable = sections.flatMap((section) =>
    section.parts.filter((part) => part.questionCount > 0),
  );
  const chosen = usable.filter((part) => selected.has(part.id));
  const questionTotal = chosen.reduce(
    (sum, part) => sum + part.questionCount,
    0,
  );

  const toggle = (ids: string[], on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  return (
    <Stack gap="md">
      <Text size="sm" c="ink.6">
        {tr(
          "Chọn một hoặc nhiều part để luyện. Bài luyện tập chỉ lưu vào lịch sử, không tính vào tiến độ, điểm cao nhất hay kiểm tra đầu vào.",
          "Pick one or more parts to practise. A practice is kept in your history only - it does not count toward progress, your best score or placement.",
        )}
      </Text>

      {sections.map((section) => {
        const label = SECTION_LABELS[section.sectionType];
        const ids = section.parts
          .filter((part) => part.questionCount > 0)
          .map((part) => part.id);
        const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
        const someOn = ids.some((id) => selected.has(id));
        return (
          <Paper key={section.id} withBorder radius="md" p="md">
            <Stack gap="sm">
              <Checkbox
                label={
                  <Text fw={700} c="navy.9">
                    {label ? tr(label.vi, label.en) : section.sectionType}
                  </Text>
                }
                checked={allOn}
                indeterminate={someOn && !allOn}
                disabled={ids.length === 0}
                onChange={(event) => toggle(ids, event.currentTarget.checked)}
              />
              <Stack gap={8} pl="lg">
                {section.parts.map((part) => (
                  <Group key={part.id} justify="space-between" wrap="nowrap">
                    <Checkbox
                      label={part.title}
                      checked={selected.has(part.id)}
                      disabled={part.questionCount === 0}
                      onChange={(event) =>
                        toggle([part.id], event.currentTarget.checked)
                      }
                    />
                    <Badge
                      variant="light"
                      color="navy"
                      radius="sm"
                      style={{ flexShrink: 0, overflow: "visible" }}
                    >
                      {part.questionCount}{" "}
                      {tr(
                        "câu",
                        part.questionCount === 1 ? "question" : "questions",
                      )}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Paper>
        );
      })}

      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Select
          label={tr("Giới hạn thời gian", "Time limit")}
          w={220}
          value={limit}
          allowDeselect={false}
          onChange={(value) => setLimit(value ?? NO_LIMIT)}
          data={[
            { value: NO_LIMIT, label: tr("Không giới hạn", "No limit") },
            ...TIME_LIMIT_MINUTES.map((minutes) => ({
              value: String(minutes),
              label: tr(`${minutes} phút`, `${minutes} minutes`),
            })),
          ]}
        />
        <Group gap="md">
          <Text size="sm" c="ink.6" role="status" aria-live="polite">
            {chosen.length === 0
              ? tr("Chưa chọn part nào", "No part chosen yet")
              : tr(
                  `Đã chọn ${chosen.length} part · ${questionTotal} câu`,
                  `${chosen.length} part${chosen.length === 1 ? "" : "s"} · ${questionTotal} question${questionTotal === 1 ? "" : "s"}`,
                )}
          </Text>
          <Button
            radius="xl"
            rightSection={<Play size={16} />}
            disabled={chosen.length === 0}
            loading={starting}
            onClick={() =>
              onStart(
                chosen.map((part) => part.id),
                limit === NO_LIMIT ? null : Number(limit),
              )
            }
          >
            {tr("Bắt đầu luyện tập", "Start practice")}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
