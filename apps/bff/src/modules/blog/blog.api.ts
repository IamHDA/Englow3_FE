import type { BackendClient } from "../../shared/http/backendClient.js";
import { toQueryString } from "../../shared/http/queryParams.js";
import type { BlogTargetType } from "../../generated/graphql.js";
import type {
  BlogCommentPageResponse,
  BlogCommentResponse,
  BlogImageUploadResponse,
  BlogLikeStateResponse,
  BlogPostDetailResponse,
  BlogPostPageResponse,
  BlogReportResponse,
  BlogTagCatalogueResponse,
  ModerationActionPageResponse,
  ModerationActionRequest,
  ModerationQueuePageResponse,
  ModerationTargetResponse,
  ReportContentRequest,
  SaveCommentRequest,
  SavePostRequest,
  StartBlogImageUploadRequest,
  UpdatePostRequest,
} from "./blog.types.js";

const BLOG_BASE_PATH = "/api/blog";
const POSTS_PATH = `${BLOG_BASE_PATH}/posts`;
const COMMENTS_PATH = `${BLOG_BASE_PATH}/comments`;
const ADMIN_BASE_PATH = "/api/admin/blog";

type PageParams = { page: number; size: number };

/** Every filter is optional: one that is not given is not sent. */
type PostListParams = PageParams & {
  q?: string | null;
  skill?: string | null;
  level?: string | null;
  certificate?: string | null;
  authorId?: string | null;
  sort?: string | null;
};

type QueueParams = PageParams & {
  type?: BlogTargetType | null;
  sort?: string | null;
};

const postPath = (id: string) => `${POSTS_PATH}/${encodeURIComponent(id)}`;
const commentPath = (id: string) =>
  `${COMMENTS_PATH}/${encodeURIComponent(id)}`;

/**
 * The admin routes take the type of content in the path, in lower case the way
 * a URL does ("post" or "comment"); the query parameter of the queue takes the
 * enum's own name. This is the one place that difference is handled.
 */
const targetPath = (type: BlogTargetType, id: string) =>
  `${ADMIN_BASE_PATH}/targets/${type.toLowerCase()}/${encodeURIComponent(id)}`;

export class BlogApi {
  constructor(private readonly client: BackendClient) {}

  list(params: PostListParams): Promise<BlogPostPageResponse> {
    return this.client.get(`${POSTS_PATH}?${toQueryString(params)}`);
  }

  post(id: string): Promise<BlogPostDetailResponse> {
    return this.client.get(postPath(id));
  }

  /** 201 */
  create(body: SavePostRequest): Promise<BlogPostDetailResponse> {
    return this.client.post(POSTS_PATH, body);
  }

  update(id: string, body: UpdatePostRequest): Promise<BlogPostDetailResponse> {
    return this.client.put(postPath(id), body);
  }

  /** 204 */
  async remove(id: string): Promise<void> {
    await this.client.delete(postPath(id));
  }

  like(id: string): Promise<BlogLikeStateResponse> {
    return this.client.put(`${postPath(id)}/like`);
  }

  unlike(id: string): Promise<BlogLikeStateResponse> {
    return this.client.delete(`${postPath(id)}/like`);
  }

  tagCatalogue(): Promise<BlogTagCatalogueResponse> {
    return this.client.get(`${BLOG_BASE_PATH}/tags`);
  }

  comments(
    postId: string,
    params: PageParams,
  ): Promise<BlogCommentPageResponse> {
    return this.client.get(
      `${postPath(postId)}/comments?${toQueryString(params)}`,
    );
  }

  /** 201 */
  createComment(
    postId: string,
    body: SaveCommentRequest,
  ): Promise<BlogCommentResponse> {
    return this.client.post(`${postPath(postId)}/comments`, body);
  }

  updateComment(
    id: string,
    body: SaveCommentRequest,
  ): Promise<BlogCommentResponse> {
    return this.client.put(commentPath(id), body);
  }

  /** 204 */
  async removeComment(id: string): Promise<void> {
    await this.client.delete(commentPath(id));
  }

  /** 201 */
  startImageUpload(
    body: StartBlogImageUploadRequest,
  ): Promise<BlogImageUploadResponse> {
    return this.client.post(`${BLOG_BASE_PATH}/images`, body);
  }

  /** 201 for a new report, 200 for the reporter's own open one: the same body. */
  reportPost(
    id: string,
    body: ReportContentRequest,
  ): Promise<BlogReportResponse> {
    return this.client.post(`${postPath(id)}/reports`, body);
  }

  /** 201 for a new report, 200 for the reporter's own open one: the same body. */
  reportComment(
    id: string,
    body: ReportContentRequest,
  ): Promise<BlogReportResponse> {
    return this.client.post(`${commentPath(id)}/reports`, body);
  }

  adminQueue(params: QueueParams): Promise<ModerationQueuePageResponse> {
    return this.client.get(`${ADMIN_BASE_PATH}/queue?${toQueryString(params)}`);
  }

  adminTarget(
    type: BlogTargetType,
    id: string,
  ): Promise<ModerationTargetResponse> {
    return this.client.get(targetPath(type, id));
  }

  adminModerate(
    type: BlogTargetType,
    id: string,
    body: ModerationActionRequest,
  ): Promise<ModerationTargetResponse> {
    return this.client.post(`${targetPath(type, id)}/actions`, body);
  }

  adminActions(params: PageParams): Promise<ModerationActionPageResponse> {
    return this.client.get(
      `${ADMIN_BASE_PATH}/actions?${toQueryString(params)}`,
    );
  }
}
