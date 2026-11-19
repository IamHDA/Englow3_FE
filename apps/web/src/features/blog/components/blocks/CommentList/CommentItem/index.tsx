"use client";

import { Anchor, Group, Paper, Stack, Text } from "@mantine/core";
import { useState } from "react";

import { BlogCommentStatus } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { commentStatusSentence } from "../../../../constants/blogLabels";
import type { BlogCommentData } from "../../../../types";
import { AuthorChip } from "../../../parts/AuthorChip";
import { Timestamp } from "../../../parts/Timestamp";
import { CommentForm } from "../../CommentForm";

import classes from "./CommentItem.module.css";

type CommentItemProps = {
  comment: BlogCommentData;
  /** Whether the viewer wrote it: they may delete it in any state, others may report it. */
  isOwn: boolean;
  /** Whether comments and likes are open on the post: a report needs it. */
  canInteract: boolean;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

/**
 * One comment. The viewer's own, when a moderator hid or removed it, stays in
 * the list - dimmed, with a line that says what happened and no Edit - so they
 * find out; nobody else is ever sent one. Edit comes from the backend's
 * `canEdit`, Delete is the author's in every state, Report is for other
 * people's visible comments.
 */
export function CommentItem({
  comment,
  isOwn,
  canInteract,
  onEdit,
  onDelete,
  onReport,
}: CommentItemProps) {
  const { t } = useLanguage();
  const copy = t.blog.comments;
  const [editing, setEditing] = useState(false);
  const statusSentence = commentStatusSentence(t.blog, comment.status);
  const visible = comment.status === BlogCommentStatus.VISIBLE;

  return (
    <Paper
      component="li"
      withBorder
      radius="md"
      p="md"
      className={classes.item}
      data-dimmed={visible ? undefined : ""}
    >
      <Stack gap="xs">
        <Group
          justify="space-between"
          gap="sm"
          wrap="nowrap"
          align="flex-start"
        >
          <AuthorChip author={comment.author} />
          <Group gap="xs" wrap="nowrap">
            <Timestamp value={comment.createdAt} />
            {comment.editedAt && (
              <Text size="xs" c="ink.5">
                {copy.edited}
              </Text>
            )}
          </Group>
        </Group>

        {statusSentence && (
          <Text size="sm" fw={600} c="warn.8" role="status">
            {statusSentence}
          </Text>
        )}

        {editing ? (
          <CommentForm
            autoFocus
            initialBody={comment.body}
            submitLabel={copy.form.editSubmit}
            onSubmit={async (body) => {
              await onEdit(comment.id, body);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <Text className={classes.body}>{comment.body}</Text>
        )}

        {!editing && (
          <Group gap="md">
            {comment.canEdit && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                onClick={() => setEditing(true)}
              >
                {copy.edit}
              </Anchor>
            )}
            {isOwn && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                c="warn.7"
                onClick={() => onDelete(comment.id)}
              >
                {copy.delete}
              </Anchor>
            )}
            {!isOwn && visible && canInteract && (
              <Anchor
                component="button"
                type="button"
                size="sm"
                c="ink.6"
                onClick={() => onReport(comment.id)}
              >
                {copy.report}
              </Anchor>
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
