"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

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

function statusOptions(isVi: boolean) {
  return [
    {
      value: ALL_OPTION_VALUE,
      label: isVi ? "Tất cả trạng thái" : "All statuses",
    },
    ...Object.values(ExamStatus).map((status) => ({
      value: status,
      label: isVi
        ? EXAM_STATUS_LABELS[status].vi
        : EXAM_STATUS_LABELS[status].en,
    })),
  ];
}

function typeOptions(isVi: boolean) {
  return [
    { value: ALL_OPTION_VALUE, label: isVi ? "Tất cả loại đề" : "All types" },
    ...Object.values(ExamType).map((type) => ({
      value: type,
      label: isVi ? EXAM_TYPE_LABELS[type].vi : EXAM_TYPE_LABELS[type].en,
    })),
  ];
}

export function AdminExamFilters({ value, onChange }: AdminExamFiltersProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder={tr("Tìm theo tiêu đề", "Search by title")}
        aria-label={tr("Tìm theo tiêu đề", "Search by title")}
        leftSection={<Search size={16} />}
        radius="md"
        w={260}
        value={value.title}
        onChange={(event) =>
          onChange({ ...value, title: event.currentTarget.value })
        }
      />
      <Select
        data={statusOptions(isVi)}
        aria-label={tr("Trạng thái", "Status")}
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
        data={typeOptions(isVi)}
        aria-label={tr("Loại đề", "Exam type")}
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
