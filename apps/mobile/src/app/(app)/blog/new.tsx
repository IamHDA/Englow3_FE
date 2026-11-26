import { Stack } from "expo-router";

import { PostEditor } from "@/features/blog/PostEditor";

export default function NewBlogPostScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Viết bài" }} />
      <PostEditor />
    </>
  );
}
