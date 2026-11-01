import type { BackendClient } from "../../shared/http/backendClient.js";
import type {
  LevelCheckResponse,
  RoadmapResponse,
  StartLevelCheckRequest,
} from "./roadmap.types.js";

const ROADMAP_PATH = "/api/roadmap";
const LEVEL_CHECKS_PATH = "/api/roadmap/level-checks";

/** The caller's own roadmap. No user id anywhere: the backend takes it from the token. */
export class RoadmapApi {
  constructor(private readonly client: BackendClient) {}

  /** Null when the learner has never had a roadmap (the backend answers 204). */
  getRoadmap(): Promise<RoadmapResponse | null> {
    return this.client.get(ROADMAP_PATH);
  }

  createRoadmap(): Promise<RoadmapResponse> {
    return this.client.post(ROADMAP_PATH);
  }

  async abandonRoadmap(): Promise<boolean> {
    await this.client.delete<null>(ROADMAP_PATH);
    return true;
  }

  recordMilestoneSitting(
    milestoneId: string,
    examAttemptId: string,
  ): Promise<RoadmapResponse> {
    return this.client.post(
      `${ROADMAP_PATH}/milestones/${encodeURIComponent(milestoneId)}/sittings`,
      { attemptId: examAttemptId },
    );
  }

  startLevelCheck(body: StartLevelCheckRequest): Promise<LevelCheckResponse> {
    return this.client.post(LEVEL_CHECKS_PATH, body);
  }

  /** Null when the learner has never started one. */
  getLatestLevelCheck(): Promise<LevelCheckResponse | null> {
    return this.client.get(`${LEVEL_CHECKS_PATH}/latest`);
  }

  getLevelCheck(id: string): Promise<LevelCheckResponse> {
    return this.client.get(`${LEVEL_CHECKS_PATH}/${encodeURIComponent(id)}`);
  }

  attachExamAttempt(
    id: string,
    attemptId: string,
  ): Promise<LevelCheckResponse> {
    return this.client.put(
      `${LEVEL_CHECKS_PATH}/${encodeURIComponent(id)}/exam-attempt`,
      { attemptId },
    );
  }

  attachSpeakingAttempt(
    id: string,
    attemptId: string,
  ): Promise<LevelCheckResponse> {
    return this.client.put(
      `${LEVEL_CHECKS_PATH}/${encodeURIComponent(id)}/speaking-attempt`,
      { attemptId },
    );
  }

  skipSpeaking(id: string): Promise<LevelCheckResponse> {
    return this.client.post(
      `${LEVEL_CHECKS_PATH}/${encodeURIComponent(id)}/skip-speaking`,
    );
  }
}
