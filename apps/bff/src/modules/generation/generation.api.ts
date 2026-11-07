import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  GenerationAllowanceResponse,
  GenerationRequestPage,
  GenerationRequestResponse,
  RequestGenerationRequest,
} from "./generation.types.js";

const PATH = "/api/admin/generation";

/**
 * AI content generation. Starting a request returns at once; the backend then
 * runs it step by step, so a screen follows it by asking again.
 */
export class GenerationApi {
  constructor(private readonly client: BackendClient) {}

  request(body: RequestGenerationRequest): Promise<GenerationRequestResponse> {
    return this.client.post(`${PATH}/requests`, body);
  }

  list(page: number, size: number): Promise<GenerationRequestPage> {
    return this.client.get(`${PATH}/requests?page=${page}&size=${size}`);
  }

  detail(id: string): Promise<GenerationRequestResponse> {
    return this.client.get(`${PATH}/requests/${encodeURIComponent(id)}`);
  }

  allowance(): Promise<GenerationAllowanceResponse> {
    return this.client.get(`${PATH}/allowance`);
  }
}
