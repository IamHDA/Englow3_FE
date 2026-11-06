import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  FullTestResponse,
  FullTestSittingResponse,
  SaveFullTestRequest,
} from "./fullTest.types.js";

const LEARNER_PATH = "/api/full-tests";
const SITTINGS_PATH = "/api/full-test-sittings";
const ADMIN_PATH = "/api/admin/full-tests";

const id = (value: string) => encodeURIComponent(value);

/**
 * IELTS full tests. The parts are sat on their own screens - the paper through
 * the exam attempt API, the five tasks through the assessment API - and a
 * sitting picks them up; nothing here submits an answer.
 */
export class FullTestApi {
  constructor(private readonly client: BackendClient) {}

  catalogue(): Promise<FullTestResponse[]> {
    return this.client.get(LEARNER_PATH);
  }

  /** Starts a sitting, or hands back the one still open. IELTS learners only. */
  start(fullTestId: string): Promise<FullTestSittingResponse> {
    return this.client.post(`${LEARNER_PATH}/${id(fullTestId)}/sittings`);
  }

  mySittings(): Promise<FullTestSittingResponse[]> {
    return this.client.get(SITTINGS_PATH);
  }

  /** Settled on the backend before it answers, so bands are current. */
  sitting(sittingId: string): Promise<FullTestSittingResponse> {
    return this.client.get(`${SITTINGS_PATH}/${id(sittingId)}`);
  }

  adminList(): Promise<FullTestResponse[]> {
    return this.client.get(ADMIN_PATH);
  }

  adminDetail(fullTestId: string): Promise<FullTestResponse> {
    return this.client.get(`${ADMIN_PATH}/${id(fullTestId)}`);
  }

  create(request: SaveFullTestRequest): Promise<FullTestResponse> {
    return this.client.post(ADMIN_PATH, request);
  }

  update(
    fullTestId: string,
    request: SaveFullTestRequest,
  ): Promise<FullTestResponse> {
    return this.client.put(`${ADMIN_PATH}/${id(fullTestId)}`, request);
  }

  submitForReview(fullTestId: string): Promise<FullTestResponse> {
    return this.client.post(
      `${ADMIN_PATH}/${id(fullTestId)}/submit-for-review`,
    );
  }

  approve(fullTestId: string): Promise<FullTestResponse> {
    return this.client.post(`${ADMIN_PATH}/${id(fullTestId)}/approve`);
  }

  reject(fullTestId: string, note: string): Promise<FullTestResponse> {
    return this.client.post(`${ADMIN_PATH}/${id(fullTestId)}/reject`, { note });
  }

  archive(fullTestId: string): Promise<FullTestResponse> {
    return this.client.post(`${ADMIN_PATH}/${id(fullTestId)}/archive`);
  }
}
