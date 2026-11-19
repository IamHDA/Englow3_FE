"use client";

import { Flex } from "@mantine/core";

import type { BlogCommentData } from "../../../types";

import { CommentItem } from "./CommentItem";
import classes from "./CommentList.module.css";

type CommentListProps = {
  comments: BlogCommentData[];
  /** The id the backend knows the viewer by, to tell their own comments. Null until it is known. */
  viewerId: string | null;
  canInteract: boolean;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

/** The comments of one page, oldest first, the viewer's own marked by what they may do to them. */
export function CommentList({
  comments,
  viewerId,
  canInteract,
  onEdit,
  onDelete,
  onReport,
}: CommentListProps) {
  return (
    <Flex component="ul" direction="column" gap="sm" className={classes.list}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwn={viewerId !== null && comment.author?.userId === viewerId}
          canInteract={canInteract}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </Flex>
  );
}
