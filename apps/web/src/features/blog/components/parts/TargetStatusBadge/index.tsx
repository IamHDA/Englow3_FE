"use client";

import { Badge } from "@mantine/core";

import type { BlogTargetStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  TARGET_STATUS_COLOR,
  TARGET_STATUS_KEY,
} from "../../../constants/blogLabels";

/** Where a piece of reported content stands, as moderation sees it. */
export function TargetStatusBadge({ status }: { status: BlogTargetStatus }) {
  const { t } = useLanguage();
  return (
    <Badge color={TARGET_STATUS_COLOR[status]} variant="light">
      {t.blog.admin.target.status[TARGET_STATUS_KEY[status]]}
    </Badge>
  );
}
