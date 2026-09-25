import { Clock, FileText, Layers } from "lucide-react";

import { LibraryCard } from "@/shared/components/LibraryCard";

import { useLanguage } from "@/shared/hooks/useLanguage";
import type { ExamListItem } from "../../../types";

type ExamCardProps = {
  exam: ExamListItem;
};

export function ExamCard({ exam }: ExamCardProps) {
  const { t, isVi } = useLanguage();
  const durationMinutes = Math.round(exam.durationSeconds / 60);

  // Status badge config
  const isStarted = exam.attemptStatus === "IN_PROGRESS";
  const isDone = exam.attemptStatus === "COMPLETED";

  const statusLabel = isDone
    ? t.exam.completed
    : isStarted
      ? t.exam.inProgress
      : t.exam.notStarted;

  // Derive skill labels based on variant or certificate
  const skills: string[] = [];
  if (exam.certificateVariant === "LR") {
    skills.push("Listening", "Reading");
  } else if (exam.certificateVariant === "SW") {
    skills.push("Speaking", "Writing");
  } else if (exam.certificateType === "IELTS") {
    skills.push("Listening", "Reading", "Writing");
  } else {
    skills.push(t.exam.generalSkill);
  }

  // Series label
  const seriesName = exam.certificateType
    ? `${exam.certificateType} ${exam.certificateVariant ?? ""}`.trim()
    : t.exam.mockTestFallback;

  const best =
    exam.bestScorePercentage != null
      ? Math.round(exam.bestScorePercentage)
      : null;

  return (
    <LibraryCard
      eyebrow={seriesName}
      status={
        isDone
          ? { label: statusLabel, color: "teal" }
          : isStarted
            ? { label: statusLabel, color: "orange" }
            : undefined
      }
      title={exam.title}
      meta={[
        {
          icon: <FileText size={15} />,
          label: `${exam.questionCount} ${t.exam.questionsUnit}`,
        },
        {
          icon: <Clock size={15} />,
          label: `${durationMinutes} ${t.exam.minutesUnit}`,
        },
        { icon: <Layers size={15} />, label: skills.join(" · ") },
      ]}
      progress={
        best != null
          ? { value: best, label: t.exam.bestScoreLabel, color: "navy" }
          : undefined
      }
      action={{
        label: isDone
          ? isVi
            ? "Làm lại"
            : "Retake"
          : isStarted
            ? isVi
              ? "Tiếp tục"
              : "Continue"
            : t.exam.startExam,
        href: `/exams/${exam.id}`,
        emphasis: isStarted ? "continue" : "default",
      }}
    />
  );
}
