"use client";

import { Modal } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import type { ReportFormValues } from "../../../schemas/report";

import { ReportForm } from "./ReportForm";

export type ReportTarget = "post" | "comment";

type ReportDialogProps = {
  opened: boolean;
  /** What is being reported: only the title says so. */
  target: ReportTarget;
  /** Files the report. Rejects with the BFF's error when the backend refused. */
  onSubmit: (values: {
    reason: ReportFormValues["reason"];
    detail: string | null;
  }) => Promise<void>;
  onClose: () => void;
};

/** The window a post or a comment is reported from: a reason and, if the person likes, a note. */
export function ReportDialog({
  opened,
  target,
  onSubmit,
  onClose,
}: ReportDialogProps) {
  const copy = useLanguage().t.blog.report;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={target === "post" ? copy.titlePost : copy.titleComment}
      centered
    >
      {/* Mounted only while open, so every report starts from an empty form. */}
      <ReportForm onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}
