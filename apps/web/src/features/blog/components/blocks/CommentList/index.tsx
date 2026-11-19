"use client";

import { Flex } from "@mantine/core";

import { ownershipOf, type BlogViewer } from "../../../hooks/useBlogViewer";
import type { BlogCommentData } from "../../../types";

import { CommentItem } from "./CommentItem";
import classes from "./CommentList.module.css";

type CommentListProps = {
  comments: BlogCommentData[];
  /** Who is looking, to tell their own comments from the rest - and not to offer Delete or Report until that is known. */
  viewer: BlogViewer;
  canInteract: boolean;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

/** The comments of one page, oldest first, the viewer's own marked by what they may do to them. */
export function CommentList({
  comments,
  viewer,
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
          ownership={ownershipOf(viewer, comment.author?.userId)}
          canInteract={canInteract}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </Flex>
  );
}
