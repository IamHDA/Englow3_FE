import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  ExamPageResponse,
  ExamResponse,
  SearchExamsParams,
} from "./exam.types.js";

const ADMIN_EXAM_BASE_PATH = "/api/admin/exams";

export class ExamApi {
  constructor(private readonly client: BackendClient) {}

  /** Admin-only on the backend (@PreAuthorize hasRole ADMIN) - it answers 403 for anyone else. */
  searchAsAdmin(params: SearchExamsParams): Promise<ExamPageResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.examType) query.set("examType", params.examType);
    if (params.title) query.set("title", params.title);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return this.client.get(`${ADMIN_EXAM_BASE_PATH}?${query.toString()}`);
  }

  /** Admin-only on the backend. Refuses a non-draft or an incomplete paper - see Exam.publish(). */
  publishAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/publish`,
    );
  }

  /** Admin-only on the backend. Refuses a paper that is already archived. */
  archiveAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(
      `${ADMIN_EXAM_BASE_PATH}/${encodeURIComponent(id)}/archive`,
    );
  }
}
