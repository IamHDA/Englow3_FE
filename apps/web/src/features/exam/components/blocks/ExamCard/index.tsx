import { Button } from "@mantine/core";
import { Clock, FileText, Play } from "lucide-react";
import Link from "next/link";

import { CEFR_COLOR_MAP } from "../../../constants/examLibrary";
import classes from "./ExamCard.module.css";

export type ExamCardData = {
  id: string;
  title: string;
  description: string;
  examType: string;
  certificateType?: string | null;
  certificateVariant?: string | null;
  targetLevel?: string | null;
  durationSeconds: number;
  maxRawScore: number;
  passScore?: number | null;
  questionCount: number;
  status: string;
  bestScore?: number | null;
  attemptStatus?: string | null;
};

type ExamCardProps = {
  exam: ExamCardData;
};

export function ExamCard({ exam }: ExamCardProps) {
  const level = exam.targetLevel ?? "B1";
  const colors = CEFR_COLOR_MAP[level] ?? {
    bg: "#F1F5F9",
    fg: "#334155",
    border: "#CBD5E1",
  };

  const durationMinutes = Math.round(exam.durationSeconds / 60);

  // Status badge config
  const isStarted = exam.attemptStatus === "IN_PROGRESS";
  const isDone = exam.attemptStatus === "COMPLETED";

  const statusLabel = isDone
    ? "Đã hoàn thành"
    : isStarted
      ? "Đang làm dở"
      : "Chưa làm";
  const statusColor = isDone ? "#10B981" : isStarted ? "#F59E0B" : "#94A3B8";

  // Derive skill labels based on variant or certificate
  const skills: string[] = [];
  if (exam.certificateVariant === "LR") {
    skills.push("Listening", "Reading");
  } else if (exam.certificateVariant === "SW") {
    skills.push("Speaking", "Writing");
  } else if (exam.certificateType === "IELTS") {
    skills.push("Listening", "Reading", "Writing");
  } else {
    skills.push("Tổng hợp");
  }

  // Series label
  const seriesName = exam.certificateType
    ? `${exam.certificateType} ${exam.certificateVariant ?? ""}`.trim()
    : "Đề thi thử";

  return (
    <div className={classes.card}>
      <div className={classes.headerRow}>
        <span
          className={classes.levelBadge}
          style={{
            background: colors.bg,
            color: colors.fg,
            borderColor: colors.border,
          }}
        >
          {level}
        </span>
        <span
          className={classes.statusIndicator}
          style={{ color: statusColor }}
        >
          <span
            className={classes.statusDot}
            style={{ background: statusColor }}
          />
          {statusLabel}
        </span>
      </div>

      <div>
        <div className={classes.seriesTag}>{seriesName}</div>
        <h3 className={classes.title} title={exam.title}>
          {exam.title}
        </h3>
      </div>

      <div className={classes.skillsRow}>
        {skills.map((skill) => (
          <span key={skill} className={classes.skillBadge}>
            {skill}
          </span>
        ))}
      </div>

      <div className={classes.spacer} />

      <div className={classes.metaRow}>
        <span className={classes.metaItem}>
          <FileText size={14} aria-hidden="true" />
          <span>{exam.questionCount} câu</span>
        </span>
        <span className={classes.metaItem}>
          <Clock size={14} aria-hidden="true" />
          <span>{durationMinutes} phút</span>
        </span>
      </div>

      <div className={classes.footerRow}>
        <div className={classes.scoreGroup}>
          <span className={classes.scoreLabel}>
            {exam.bestScore !== null && exam.bestScore !== undefined
              ? "Điểm cao nhất"
              : "Điểm tối đa"}
          </span>
          <span className={classes.scoreValue}>
            {exam.bestScore !== null && exam.bestScore !== undefined
              ? `${exam.bestScore}/${exam.maxRawScore}`
              : `${exam.maxRawScore} điểm`}
          </span>
        </div>

        <Button
          component={Link}
          href={`/mock-test/${exam.id}`}
          size="sm"
          className={classes.ctaButton}
          color={isDone ? "gray" : isStarted ? "orange" : "blue"}
          variant={isDone ? "outline" : "filled"}
          rightSection={
            <Play size={13} fill="currentColor" aria-hidden="true" />
          }
        >
          {isDone ? "Làm lại" : isStarted ? "Làm tiếp" : "Bắt đầu làm bài"}
        </Button>
      </div>
    </div>
  );
}
