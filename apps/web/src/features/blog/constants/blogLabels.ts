import {
  BlogModerationAction,
  BlogPostStatus,
  BlogReportReason,
  BlogReportStatus,
  BlogTargetStatus,
  BlogTargetType,
  BlogTagKind,
  BlogCommentStatus,
} from "@/lib/graphql/generated";
import type { BlogTranslations } from "@/shared/constants/translations";

/*
 * What each value of a schema enum is shown as: the key of its sentence in the
 * translations. A Record keyed by the generated enum, so a value added to the
 * schema is a type error here until it has words.
 */

export const REPORT_REASON_KEY = {
  [BlogReportReason.SPAM]: "spam",
  [BlogReportReason.HARASSMENT]: "harassment",
  [BlogReportReason.INAPPROPRIATE]: "inappropriate",
  [BlogReportReason.MISINFORMATION]: "misinformation",
  [BlogReportReason.OTHER]: "other",
} as const satisfies Record<
  BlogReportReason,
  keyof BlogTranslations["reportReasons"]
>;

/** The reasons in the order a person is offered them. */
export const REPORT_REASONS: readonly BlogReportReason[] = [
  BlogReportReason.SPAM,
  BlogReportReason.HARASSMENT,
  BlogReportReason.INAPPROPRIATE,
  BlogReportReason.MISINFORMATION,
  BlogReportReason.OTHER,
];

export const TAG_KIND_KEY = {
  [BlogTagKind.SKILL]: "skill",
  [BlogTagKind.LEVEL]: "level",
  [BlogTagKind.CERTIFICATE]: "certificate",
} as const satisfies Record<
  BlogTagKind,
  keyof BlogTranslations["tags"]["kinds"]
>;

/** The kinds of tag in the order they are shown. */
export const TAG_KINDS: readonly BlogTagKind[] = [
  BlogTagKind.SKILL,
  BlogTagKind.LEVEL,
  BlogTagKind.CERTIFICATE,
];

export const TARGET_STATUS_KEY = {
  [BlogTargetStatus.PUBLISHED]: "published",
  [BlogTargetStatus.VISIBLE]: "visible",
  [BlogTargetStatus.HIDDEN]: "hidden",
  [BlogTargetStatus.REMOVED]: "removed",
  [BlogTargetStatus.DELETED]: "deleted",
} as const satisfies Record<
  BlogTargetStatus,
  keyof BlogTranslations["admin"]["target"]["status"]
>;

export const REPORT_STATUS_KEY = {
  [BlogReportStatus.OPEN]: "open",
  [BlogReportStatus.RESOLVED]: "resolved",
  [BlogReportStatus.DISMISSED]: "dismissed",
} as const satisfies Record<
  BlogReportStatus,
  keyof BlogTranslations["admin"]["target"]["reportStatus"]
>;

export const MODERATION_ACTION_KEY = {
  [BlogModerationAction.HIDE]: "hide",
  [BlogModerationAction.RESTORE]: "restore",
  [BlogModerationAction.REMOVE]: "remove",
  [BlogModerationAction.DISMISS]: "dismiss",
} as const satisfies Record<
  BlogModerationAction,
  keyof BlogTranslations["admin"]["form"]["actions"]
>;

/** The colour of the badge for a post a moderator acted on. */
export const POST_STATUS_COLOR = {
  [BlogPostStatus.PUBLISHED]: "green",
  [BlogPostStatus.HIDDEN]: "orange",
  [BlogPostStatus.REMOVED]: "warn",
} as const satisfies Record<BlogPostStatus, string>;

/** The sentence under a comment of the viewer's own that a moderator acted on. */
export function commentStatusSentence(
  copy: BlogTranslations,
  status: BlogCommentStatus,
): string | null {
  switch (status) {
    case BlogCommentStatus.VISIBLE:
      return null;
    case BlogCommentStatus.HIDDEN:
      return copy.status.commentHidden;
    case BlogCommentStatus.REMOVED:
      return copy.status.commentRemoved;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}

/** The label of a post's status badge, or null for a published post (it has none). */
export function postStatusLabel(
  copy: BlogTranslations,
  status: BlogPostStatus,
): string | null {
  switch (status) {
    case BlogPostStatus.PUBLISHED:
      return null;
    case BlogPostStatus.HIDDEN:
      return copy.status.postHidden;
    case BlogPostStatus.REMOVED:
      return copy.status.postRemoved;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
}

/** The label of what kind of content a queue row or a history entry is about. */
export function targetTypeLabel(
  copy: BlogTranslations,
  type: BlogTargetType,
): string {
  switch (type) {
    case BlogTargetType.POST:
      return copy.admin.queue.typePost;
    case BlogTargetType.COMMENT:
      return copy.admin.queue.typeComment;
    default: {
      const unreachable: never = type;
      return unreachable;
    }
  }
}

/**
 * Which actions the screen offers for content in a status. This is only to save
 * a mis-click - the backend decides and refuses the rest with
 * BLOG_MODERATION_INVALID_TRANSITION or BLOG_NO_OPEN_REPORTS: hide what is
 * showing, restore what is hidden, remove what is not removed yet, dismiss while
 * reports are open.
 */
export function offeredActions(
  status: BlogTargetStatus,
  openReports: number,
): BlogModerationAction[] {
  const offered: BlogModerationAction[] = [];
  switch (status) {
    case BlogTargetStatus.PUBLISHED:
    case BlogTargetStatus.VISIBLE:
      offered.push(BlogModerationAction.HIDE, BlogModerationAction.REMOVE);
      break;
    case BlogTargetStatus.HIDDEN:
      offered.push(BlogModerationAction.RESTORE, BlogModerationAction.REMOVE);
      break;
    case BlogTargetStatus.REMOVED:
    case BlogTargetStatus.DELETED:
      break;
    default: {
      const unreachable: never = status;
      return unreachable;
    }
  }
  if (openReports > 0) offered.push(BlogModerationAction.DISMISS);
  return offered;
}

/** "1 like" / "5 likes": the singular or plural sentence of a pair, with the number put in. */
export function countLabel(count: number, one: string, other: string): string {
  return (count === 1 ? one : other).replace("{count}", String(count));
}

/** The colour of the badge of a piece of content's status. */
export const TARGET_STATUS_COLOR = {
  [BlogTargetStatus.PUBLISHED]: "green",
  [BlogTargetStatus.VISIBLE]: "green",
  [BlogTargetStatus.HIDDEN]: "orange",
  [BlogTargetStatus.REMOVED]: "warn",
  [BlogTargetStatus.DELETED]: "ink",
} as const satisfies Record<BlogTargetStatus, string>;

/** The colour of the badge of what a moderator did. */
export const MODERATION_ACTION_COLOR = {
  [BlogModerationAction.HIDE]: "orange",
  [BlogModerationAction.RESTORE]: "green",
  [BlogModerationAction.REMOVE]: "warn",
  [BlogModerationAction.DISMISS]: "ink",
} as const satisfies Record<BlogModerationAction, string>;

/** The colour of the badge of a report's status. */
export const REPORT_STATUS_COLOR = {
  [BlogReportStatus.OPEN]: "orange",
  [BlogReportStatus.RESOLVED]: "green",
  [BlogReportStatus.DISMISSED]: "ink",
} as const satisfies Record<BlogReportStatus, string>;
