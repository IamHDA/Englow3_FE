"use client";

import { Badge, Flex, Group, Paper, Stack, Text } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  REPORT_REASON_KEY,
  REPORT_STATUS_COLOR,
  REPORT_STATUS_KEY,
} from "../../../constants/blogLabels";
import type { ModerationTargetData } from "../../../types";
import { AuthorChip } from "../../parts/AuthorChip";
import { Timestamp } from "../../parts/Timestamp";

import classes from "./ModerationReportList.module.css";

/**
 * Every report about a piece of content, open and closed: who made it (an
 * erased account shows as a deleted user), why, their note, where it stands, and
 * - once it is closed - when and with what outcome.
 */
export function ModerationReportList({
  reports,
}: {
  reports: ModerationTargetData["reports"];
}) {
  const { t } = useLanguage();
  const copy = t.blog.admin.target;

  if (reports.length === 0) {
    return (
      <Text size="sm" c="ink.6">
        {copy.noReports}
      </Text>
    );
  }

  return (
    <Flex component="ul" direction="column" gap="sm" className={classes.list}>
      {reports.map((report) => (
        <Paper component="li" key={report.id} withBorder radius="md" p="md">
          <Stack gap="xs">
            <Group justify="space-between" gap="xs" align="flex-start">
              <Group gap="xs" wrap="wrap">
                <Badge variant="light" color="brand">
                  {t.blog.reportReasons[REPORT_REASON_KEY[report.reason]]}
                </Badge>
                <Badge
                  variant="light"
                  color={REPORT_STATUS_COLOR[report.status]}
                >
                  {copy.reportStatus[REPORT_STATUS_KEY[report.status]]}
                </Badge>
              </Group>
              <Timestamp value={report.createdAt} withTime />
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text size="xs" c="ink.5">
                {copy.reportedBy}
              </Text>
              <AuthorChip author={report.reporter} size={24} />
            </Group>
            {report.detail && (
              <Text size="sm" className={classes.note}>
                <Text span fw={600}>
                  {copy.note}:
                </Text>{" "}
                {report.detail}
              </Text>
            )}
            {report.resolvedAt && (
              <Text size="xs" c="ink.5">
                {copy.resolvedOn}{" "}
                <Timestamp value={report.resolvedAt} withTime span />
                {report.resolutionNote
                  ? ` · ${copy.resolution}: ${report.resolutionNote}`
                  : ""}
              </Text>
            )}
          </Stack>
        </Paper>
      ))}
    </Flex>
  );
}
