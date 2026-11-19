"use client";

import { Flex } from "@mantine/core";

import type { BlogPostSummaryData } from "../../../types";
import { PostCard } from "../PostCard";

import classes from "./PostList.module.css";

/** The cards of a list of posts, one under the other. The same list at /blog and on a wall. */
export function PostList({ posts }: { posts: BlogPostSummaryData[] }) {
  return (
    <Flex component="ul" direction="column" gap="md" className={classes.list}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </Flex>
  );
}
