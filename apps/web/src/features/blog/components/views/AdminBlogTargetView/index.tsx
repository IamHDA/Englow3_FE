"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

import {
  AdminBlogTargetDocument,
  BlogReportStatus,
  BlogTargetType,
} from "@/lib/graphql/generated";
import {
  useAdminBlogTargetQuery,
  useAdminModerateBlogMutation,
} from "@/lib/graphql/generated/hooks";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { BLOG_ROUTES } from "../../../constants/blog";
import {
  countLabel,
  offeredActions,
  targetTypeLabel,
} from "../../../constants/blogLabels";
import type { ModerationFormValues } from "../../../schemas/moderation";
import { useBlogViewer } from "../../../hooks/useBlogViewer";
import { MarkdownContent } from "../../blocks/MarkdownContent";
import { ModerationActionForm } from "../../blocks/ModerationActionForm";
import { ModerationActionFormSkeleton } from "../../blocks/ModerationActionForm/ModerationActionFormSkeleton";
import { ModerationHistory } from "../../blocks/ModerationHistory";
import { ModerationReportList } from "../../blocks/ModerationReportList";
import { AuthorChip } from "../../parts/AuthorChip";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { TagBadges } from "../../parts/TagBadges";
import { TargetStatusBadge } from "../../parts/TargetStatusBadge";
import { Timestamp } from "../../parts/Timestamp";

import { AdminBlogTargetViewSkeleton } from "./AdminBlogTargetViewSkeleton";
import classes from "./AdminBlogTargetView.module.css";

type AdminBlogTargetViewProps = {
  type: BlogTargetType;
  id: string;
};

/**
 * /admin/blog/[type]/[id]: one reported post or comment in any state - its
 * content, every report about it, the history of what was done - and the form
 * to act on it. A post is drawn as readers see it (Markdown, its images); a
 * comment is plain text, as readers see that. The form offers the actions that
 * suit its state; the backend still decides. Content the moderator wrote
 * themselves has no form and says why - the backend refuses it too. What the
 * action answers with is the content as it is afterwards, and replaces the
 * page's own copy.
 */
export function AdminBlogTargetView({ type, id }: AdminBlogTargetViewProps) {
  const { t } = useLanguage();
  const copy = t.blog.admin.target;
  const viewer = useBlogViewer();
  const { data, error, refetch } = useAdminBlogTargetQuery({
    variables: { type, id },
    fetchPolicy: "cache-and-network",
  });
  const [moderate] = useAdminModerateBlogMutation();

  const back = { href: BLOG_ROUTES.adminQueue, label: copy.back };
  const target = data?.adminBlogTarget;

  if (!target) {
    return error ? (
      <LoadErrorState
        error={error}
        thing={copy.thing}
        back={back}
        onRetry={() => void refetch().catch(() => undefined)}
      />
    ) : (
      <AdminBlogTargetViewSkeleton />
    );
  }

  const openReports = target.reports.filter(
    (report) => report.status === BlogReportStatus.OPEN,
  ).length;
  const content = target.content;

  async function act({ action, reason }: ModerationFormValues) {
    await moderate({
      variables: { type, id, action, reason },
      update: (cache, { data: result }) => {
        if (!result) return;
        // The answer is the content as it is now; its key is the query's, so it is written there.
        cache.writeQuery({
          query: AdminBlogTargetDocument,
          variables: { type, id },
          data: { adminBlogTarget: result.adminModerateBlog },
        });
      },
      refetchQueries: ["AdminBlogQueue", "AdminBlogActions"],
    });
    notifications.show({ color: "teal", message: t.blog.admin.form.done });
  }

  // Whose content this is decides whether the form is there at all, so it is not
  // drawn until the viewer's own id is known: for the moment a profile takes to
  // load - or for good, if it failed - a moderator would be shown a form on
  // their own content.
  let decision;
  switch (viewer.status) {
    case "loading":
      decision = <ModerationActionFormSkeleton />;
      break;
    case "failed":
      decision = (
        <BlogLoadError
          title={t.blog.viewer.errorTitle}
          description={t.blog.viewer.errorDescription}
          retryLabel={t.blog.viewer.retry}
          onRetry={viewer.retry}
        />
      );
      break;
    case "known":
      decision =
        target.author !== null && target.author.userId === viewer.id ? (
          <Alert
            color="orange"
            radius="md"
            role="status"
            icon={<ShieldAlert size={20} aria-hidden="true" />}
          >
            {copy.ownContent}
          </Alert>
        ) : (
          <ModerationActionForm
            actions={offeredActions(target.targetStatus, openReports)}
            onSubmit={act}
          />
        );
      break;
    default: {
      const unreachable: never = viewer;
      return unreachable;
    }
  }

  return (
    <>
      <PageHeader
        title={copy.title}
        above={
          <Button
            component={Link}
            href={BLOG_ROUTES.adminQueue}
            variant="subtle"
            color="ink"
            size="compact-md"
            w="fit-content"
            leftSection={<ArrowLeft size={16} aria-hidden="true" />}
          >
            {copy.back}
          </Button>
        }
      />

      <Group gap="xs" wrap="wrap">
        <Badge variant="outline" color="ink">
          {targetTypeLabel(t.blog, target.targetType)}
        </Badge>
        <TargetStatusBadge status={target.targetStatus} />
        {openReports > 0 && (
          <Badge color="orange" variant="filled">
            {countLabel(
              openReports,
              copy.openReportsOne,
              copy.openReportsOther,
            )}
          </Badge>
        )}
      </Group>

      <Paper withBorder radius="lg" p={{ base: "md", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz={20} c="navy.9">
            {copy.content}
          </Title>
          {content ? (
            <>
              {content.title && (
                <Text fw={700} fz={18} c="navy.9" className={classes.title}>
                  {target.targetType === BlogTargetType.COMMENT
                    ? `${copy.commentOn} “${content.title}”`
                    : content.title}
                </Text>
              )}
              <Group gap="md">
                <AuthorChip author={target.author} size={32} />
                <Timestamp value={content.createdAt} withTime size="sm" />
              </Group>
              <TagBadges tags={content.tags} />
              {target.targetType === BlogTargetType.POST ? (
                <MarkdownContent body={content.body} images={content.images} />
              ) : (
                <Text className={classes.comment}>{content.body}</Text>
              )}
            </>
          ) : (
            <Text fs="italic" c="ink.6">
              {copy.contentGone}
            </Text>
          )}
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p={{ base: "md", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz={20} c="navy.9">
            {t.blog.admin.form.title}
          </Title>
          {decision}
        </Stack>
      </Paper>

      <Stack gap="sm">
        <Title order={2} fz={20} c="navy.9">
          {copy.reports}
        </Title>
        <ModerationReportList reports={target.reports} />
      </Stack>

      <Stack gap="sm">
        <Title order={2} fz={20} c="navy.9">
          {copy.history}
        </Title>
        <ModerationHistory
          emptyText={copy.noHistory}
          entries={target.actions.map((action) => ({
            id: action.id,
            action: action.action,
            reason: action.reason,
            createdAt: action.createdAt,
            moderator: action.moderator,
          }))}
        />
      </Stack>
    </>
  );
}
