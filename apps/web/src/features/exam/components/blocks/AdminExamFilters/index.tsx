"use client";

import { Group, Select, TextInput } from "@mantine/core";
import { Search } from "lucide-react";

import {
  EXAM_STATUS_LABELS,
  EXAM_TYPE_LABELS,
} from "../../../constants/adminExams";

import { ExamStatus, ExamType } from "@/lib/graphql/generated";

export type AdminExamFiltersState = {
  status: ExamStatus | null;
  examType: ExamType | null;
  title: string;
};

type AdminExamFiltersProps = {
  value: AdminExamFiltersState;
  onChange: (next: AdminExamFiltersState) => void;
};

const ALL_OPTION_VALUE = "";

const statusOptions = [
  { value: ALL_OPTION_VALUE, label: "Tất cả trạng thái" },
  ...Object.values(ExamStatus).map((status) => ({
    value: status,
    label: EXAM_STATUS_LABELS[status],
  })),
];

const typeOptions = [
  { value: ALL_OPTION_VALUE, label: "Tất cả loại đề" },
  ...Object.values(ExamType).map((type) => ({
    value: type,
    label: EXAM_TYPE_LABELS[type],
  })),
];

export function AdminExamFilters({ value, onChange }: AdminExamFiltersProps) {
  return (
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder="Tìm theo tiêu đề"
        leftSection={<Search size={16} />}
        radius="md"
        w={260}
        value={value.title}
        onChange={(event) =>
          onChange({ ...value, title: event.currentTarget.value })
        }
      />
      <Select
        data={statusOptions}
        radius="md"
        w={190}
        allowDeselect={false}
        value={value.status ?? ALL_OPTION_VALUE}
        onChange={(next) =>
          onChange({
            ...value,
            status: next === ALL_OPTION_VALUE ? null : (next as ExamStatus),
          })
        }
      />
      <Select
        data={typeOptions}
        radius="md"
        w={180}
        allowDeselect={false}
        value={value.examType ?? ALL_OPTION_VALUE}
        onChange={(next) =>
          onChange({
            ...value,
            examType: next === ALL_OPTION_VALUE ? null : (next as ExamType),
          })
        }
      />
    </Group>
  );
}
