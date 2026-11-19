// What a wall (the friends feature's page) imports, and nothing else: the
// section of posts and its skeleton. The barrel would bring every screen of the
// blog - the editor, the moderation views, the Markdown renderer - into a page
// that only lists a few cards.
export { WallPosts } from "./components/blocks/WallPosts";
export { WallPostsSkeleton } from "./components/blocks/WallPosts/WallPostsSkeleton";
export { WALL_POSTS_PAGE_SIZE } from "./constants/blog";
