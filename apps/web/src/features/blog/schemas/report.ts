import { z } from "zod";

import { BlogReportReason } from "@/lib/graphql/generated";

import { MAX_REPORT_DETAIL_LENGTH } from "../constants/blog";

export type ReportSchemaMessages = {
  reasonRequired: string;
  detailTooLong: string;
};

/** A report: a reason, and a note of at most 500 characters that may be left out (ReportContentRequest). */
export function createReportSchema(m: ReportSchemaMessages) {
  return z.object({
    reason: z.enum(BlogReportReason, { error: m.reasonRequired }),
    detail: z.string().max(MAX_REPORT_DETAIL_LENGTH, m.detailTooLong),
  });
}

export type ReportFormValues = z.infer<ReturnType<typeof createReportSchema>>;
