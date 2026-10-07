import type { BackendClient } from "../../shared/http/backendClient.js";
import type { AssessmentTaskInput } from "../../generated/graphql.js";
import type {
  AssessmentAttempt,
  AssessmentAttemptPage,
  AssessmentTask,
  AssessmentTaskPage,
  AssessmentUpload,
  AssessmentCapabilities,
} from "../../generated/graphql.js";
import { GraphQLError } from "graphql";
export class AssessmentApi {
  constructor(private readonly client: BackendClient) {}
  workload() {
    return this.client.get<
      import("../../generated/graphql.js").AssessmentWorkload
    >("/api/admin/assessments/workload");
  }
  authoringTask(id: string) {
    return this.client.get<AssessmentTask>(
      "/api/admin/assessments/tasks/" + encodeURIComponent(id),
    );
  }
  reviews(id: string) {
    return this.client.get<
      import("../../generated/graphql.js").AssessmentReview[]
    >(
      "/api/admin/assessments/submissions/" +
        encodeURIComponent(id) +
        "/reviews",
    );
  }
  capabilities(): Promise<AssessmentCapabilities> {
    return this.client.get("/api/assessments/capabilities");
  }
  tasks(skill?: string | null, page = 0): Promise<AssessmentTaskPage> {
    return this.client.get("/api/assessments/tasks?" + params({ skill, page }));
  }
  task(id: string): Promise<AssessmentTask> {
    return this.client.get("/api/assessments/tasks/" + encodeURIComponent(id));
  }
  attempt(id: string, admin = false): Promise<AssessmentAttempt> {
    return this.client.get(
      (admin
        ? "/api/admin/assessments/submissions/"
        : "/api/assessments/attempts/") + encodeURIComponent(id),
    );
  }
  notifications(page = 0) {
    return this.client.get<
      import("../../generated/graphql.js").AssessmentNotificationPage
    >("/api/assessments/notifications?" + params({ page }));
  }
  readResult(id: string, version: number) {
    return this.client.post<boolean>(
      "/api/assessments/notifications/" + encodeURIComponent(id) + "/read",
      { version },
    );
  }
  history(
    taskId?: string | null,
    page = 0,
    skill?: string | null,
    status?: string | null,
    title?: string | null,
  ): Promise<AssessmentAttemptPage> {
    return this.client.get(
      "/api/assessments/attempts?" +
        params({ taskId, page, skill, status, title }),
    );
  }
  authoring(
    skill?: string | null,
    status?: string | null,
    page = 0,
  ): Promise<AssessmentTaskPage> {
    return this.client.get(
      "/api/admin/assessments/tasks?" + params({ skill, status, page }),
    );
  }
  submissions(
    status?: string | null,
    page = 0,
    skill?: string | null,
    term?: string | null,
    oldest = true,
  ): Promise<import("../../generated/graphql.js").AssessmentSubmissionPage> {
    return this.client.get(
      "/api/admin/assessments/submissions?" +
        params({
          status,
          page,
          skill,
          term,
          oldest: oldest ? "true" : "false",
        }),
    );
  }
  start(
    taskId: string,
    clientKey: string,
    contentType?: string | null,
    contentLength?: number | null,
  ): Promise<AssessmentUpload> {
    return this.client.post(
      "/api/assessments/tasks/" + encodeURIComponent(taskId) + "/attempts",
      { clientKey, contentType, contentLength },
    );
  }
  save(
    id: string,
    answerText: string,
    version: number,
  ): Promise<AssessmentAttempt> {
    return this.client.put(
      "/api/assessments/attempts/" + encodeURIComponent(id) + "/draft",
      { answerText, version },
    );
  }
  action(
    id: string,
    action: "submit" | "retry" | "request-review",
  ): Promise<AssessmentAttempt> {
    return this.client.post(
      "/api/assessments/attempts/" + encodeURIComponent(id) + "/" + action,
    );
  }
  create(input: AssessmentTaskInput): Promise<AssessmentTask> {
    return this.client.post("/api/admin/assessments/tasks", input);
  }
  edit(
    id: string,
    version: number,
    input: AssessmentTaskInput,
  ): Promise<AssessmentTask> {
    return this.client.put(
      "/api/admin/assessments/tasks/" +
        encodeURIComponent(id) +
        "?version=" +
        version,
      input,
    );
  }
  transition(
    id: string,
    action: string,
    note?: string | null,
  ): Promise<AssessmentTask> {
    if (!["submit", "approve", "reject", "archive", "restore"].includes(action))
      throw new GraphQLError("Invalid task action", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    return this.client.post(
      "/api/admin/assessments/tasks/" + encodeURIComponent(id) + "/" + action,
      note ? { note } : undefined,
    );
  }
  grade(
    id: string,
    report: string,
    note: string,
    transcript: string | null | undefined,
    version: number,
  ): Promise<AssessmentAttempt> {
    return this.client.post(
      "/api/admin/assessments/submissions/" + encodeURIComponent(id) + "/grade",
      { report, note, transcript, version },
    );
  }
}
function params(values: Record<string, string | number | null | undefined>) {
  const p = new URLSearchParams({ size: "12" });
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== null) p.set(key, String(value));
  return p.toString();
}
