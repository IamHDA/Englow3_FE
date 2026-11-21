"use client";

import { Divider, Flex } from "@mantine/core";

import type { BlogPostSummaryData } from "../../../types";
import { PostRow } from "../PostRow";

import classes from "./PostRowList.module.css";

type PostRowListProps = {
  posts: BlogPostSummaryData[];
  /** The post whose save or unsave is on its way, if any. */
  savingId: string | null;
  onToggleSave: (post: BlogPostSummaryData) => void;
};

/** The posts of /blog and of /blog/saved, one under the other and a hairline between. */
export function PostRowList({
  posts,
  savingId,
  onToggleSave,
}: PostRowListProps) {
  return (
    <Flex component="ul" direction="column" className={classes.list}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostRow
            post={post}
            savePending={savingId === post.id}
            onToggleSave={() => onToggleSave(post)}
          />
          <Divider />
        </li>
      ))}
    </Flex>
  );
}
