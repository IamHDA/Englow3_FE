import { BlogTargetType } from "@/lib/graphql/generated";

/* ---- Limits: what the backend takes (matches backend) -------------------- */
// The backend decides - these only say so while the person types, before a save
// is refused. Each is a rule of SavePostRequest, SaveCommentRequest,
// ReportContentRequest, ModerationActionRequest or BlogImages.

/** matches backend: SavePostRequest.title */
export const MAX_TITLE_LENGTH = 200;
/** matches backend: SavePostRequest.body */
export const MAX_BODY_LENGTH = 20_000;
/** matches backend: SaveCommentRequest.body */
export const MAX_COMMENT_LENGTH = 2_000;
/** matches backend: ReportContentRequest.detail */
export const MAX_REPORT_DETAIL_LENGTH = 500;
/** matches backend: ModerationActionRequest.reason */
export const MAX_MODERATION_REASON_LENGTH = 500;
/** matches backend: BlogPost.MAX_TAGS */
export const MAX_TAGS = 8;
/** matches backend: BlogPostServiceImpl.MAX_IMAGES_PER_POST */
export const MAX_IMAGES = 10;
/** matches backend: BlogImages.TYPES */
export const IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
/** matches backend: BlogImages.MAX_BYTES */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
/** Megabytes, for the sentence that names the limit. */
export const IMAGE_MAX_MB = IMAGE_MAX_BYTES / (1024 * 1024);
/** matches backend: BlogPostServiceImpl.MIN_SEARCH_TERM_LENGTH */
export const MIN_SEARCH_TERM_LENGTH = 2;

/** The longest wait for the PUT to object storage. */
export const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

/** A search waits for a pause in typing this long. */
export const SEARCH_DEBOUNCE_MS = 300;

/** The counter under a text box appears once the text is this close to its limit. */
export const BODY_COUNTER_FROM = 18_000;
export const COMMENT_COUNTER_FROM = 1_800;

/* ---- Lists ---------------------------------------------------------------- */
// The backend allows up to 50 on each of these.

export const POSTS_PAGE_SIZE = 10;
export const WALL_POSTS_PAGE_SIZE = 5;
export const COMMENTS_PAGE_SIZE = 20;
export const ADMIN_QUEUE_PAGE_SIZE = 20;
export const ADMIN_ACTIONS_PAGE_SIZE = 20;

/* ---- Where the screens live ----------------------------------------------- */

const enc = encodeURIComponent;

export const BLOG_ROUTES = {
  list: "/blog",
  write: "/blog/new",
  post: (postId: string) => `/blog/${enc(postId)}`,
  edit: (postId: string) => `/blog/${enc(postId)}/edit`,
  wall: (userId: string) => `/people/${enc(userId)}`,
  adminQueue: "/admin/blog",
  adminActions: "/admin/blog/actions",
  /** The path says the type in lower case, the way the backend's own routes do. */
  adminTarget: (type: BlogTargetType, id: string) =>
    `/admin/blog/${type.toLowerCase()}/${enc(id)}`,
} as const;

/** The segment of /admin/blog/[type]/[id] for each type of content, and back. */
export const TARGET_TYPE_SEGMENT = {
  post: BlogTargetType.POST,
  comment: BlogTargetType.COMMENT,
} as const;

/* ---- Backend codes the screens branch on ---------------------------------- */
// Every other code shows its sentence from the translations, or the general one.

export const BACKEND_CODES = {
  postNotFound: "BLOG_POST_NOT_FOUND",
  targetNotFound: "BLOG_TARGET_NOT_FOUND",
  postStale: "BLOG_POST_STALE",
  titleInvalid: "BLOG_TITLE_INVALID",
  bodyInvalid: "BLOG_BODY_INVALID",
  tooManyTags: "BLOG_TOO_MANY_TAGS",
  tagInvalid: "BLOG_TAG_INVALID",
  tooManyImages: "BLOG_TOO_MANY_IMAGES",
  imageNotUploaded: "BLOG_IMAGE_NOT_UPLOADED",
  imageInvalid: "BLOG_IMAGE_INVALID",
  commentInvalid: "BLOG_COMMENT_INVALID",
  reportDetailTooLong: "BLOG_REPORT_DETAIL_TOO_LONG",
  moderationReasonInvalid: "BLOG_MODERATION_REASON_INVALID",
  moderationOwnContent: "BLOG_MODERATION_OWN_CONTENT",
} as const;

/** The field of the post form a refusal of the save belongs under. */
export const POST_FIELD_BY_CODE: Readonly<
  Record<string, "title" | "body" | "tags">
> = {
  [BACKEND_CODES.titleInvalid]: "title",
  [BACKEND_CODES.bodyInvalid]: "body",
  [BACKEND_CODES.tooManyTags]: "tags",
  [BACKEND_CODES.tagInvalid]: "tags",
  [BACKEND_CODES.tooManyImages]: "body",
  [BACKEND_CODES.imageNotUploaded]: "body",
  [BACKEND_CODES.imageInvalid]: "body",
};

/**
 * Names of the queries a write changes the answer of, refreshed after it. They
 * are the operation names in graphql/*.graphql (and the wall's, which lists
 * posts too).
 */
export const POST_QUERY_NAMES: ReadonlySet<string> = new Set([
  "BlogPosts",
  "BlogPost",
  "UserWall",
]);
export const ADMIN_QUERY_NAMES: ReadonlySet<string> = new Set([
  "AdminBlogQueue",
  "AdminBlogTarget",
  "AdminBlogActions",
]);
