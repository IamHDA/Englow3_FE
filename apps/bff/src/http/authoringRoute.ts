import express, {
  type Request,
  type Response,
  type ErrorRequestHandler,
} from "express";
import { createBackendClient } from "../shared/http/backendClient.js";
import { BackendError } from "../shared/http/backendError.js";
import { logServerError } from "../shared/http/logServerError.js";

// Explicit module routes only. Large content trees use REST alongside import;
// arbitrary backend URLs and methods cannot be supplied by a caller.
const paths: Record<string, string> = {
  FLASHCARD_SET: "/api/admin/flashcards/sets",
  QUIZ: "/api/admin/quizzes",
  DICTATION_LESSON: "/api/admin/dictation/lessons",
  SPEAKING_PROMPT: "/api/admin/speaking/prompts",
  EXAM: "/api/admin/exams",
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function authoringRoute() {
  const router = express.Router();
  router.post(
    "/admin/authoring/:kind/:id/media",
    express.raw({
      type: ["audio/mpeg", "audio/wav", "image/jpeg", "image/png"],
      limit: "12mb",
    }),
    (req, res) => {
      if (
        !uuid.test(req.params.id) ||
        !["EXAM", "DICTATION_LESSON", "FLASHCARD_SET"].includes(req.params.kind)
      )
        return void res.sendStatus(404);
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        return void res.status(400).json({
          code: "MEDIA_REQUIRED",
          message: "Choose a supported audio or image file",
        });
      const form = new FormData();
      form.append(
        "file",
        new Blob([new Uint8Array(req.body)], { type: req.get("content-type") }),
        "media",
      );
      const path =
        req.params.kind === "EXAM"
          ? `${paths.EXAM}/${req.params.id}/media`
          : req.params.kind === "FLASHCARD_SET"
            ? "/api/admin/flashcards/media"
            : "/api/admin/dictation/media";
      return forward(req, res, "POST", path, form);
    },
  );
  router.use(express.json({ limit: "2mb" }));
  router.get("/admin/authoring/:kind/:id", (req, res) => {
    const base = paths[req.params.kind];
    if (!base || !uuid.test(req.params.id)) return void res.sendStatus(404);
    return forward(req, res, "GET", `${base}/${req.params.id}/authoring`);
  });
  router.post("/admin/authoring/:kind", (req, res) => {
    const base = paths[req.params.kind];
    if (!base) return void res.sendStatus(404);
    return forward(req, res, "POST", `${base}/authoring`, req.body);
  });
  router.put("/admin/authoring/:kind/:id", (req, res) => {
    const base = paths[req.params.kind];
    if (!base || !uuid.test(req.params.id)) return void res.sendStatus(404);
    return forward(
      req,
      res,
      "PUT",
      `${base}/${req.params.id}/authoring`,
      req.body,
    );
  });
  router.put("/admin/authoring/EXAM/:id/content", (req, res) => {
    if (!uuid.test(req.params.id)) return void res.sendStatus(404);
    return forward(
      req,
      res,
      "PUT",
      `${paths.EXAM}/${req.params.id}/content`,
      req.body,
    );
  });
  const parserError: ErrorRequestHandler = (error, _req, res, next) => {
    if (error?.type === "entity.too.large")
      return void res.status(413).json({
        code: "PAYLOAD_TOO_LARGE",
        message: "The content or file exceeds the upload limit",
      });
    if (error?.type === "entity.parse.failed")
      return void res.status(400).json({
        code: "INVALID_JSON",
        message: "The content must be valid JSON",
      });
    next(error);
  };
  router.use(parserError);
  return router;
}
async function forward(
  req: Request,
  res: Response,
  method: string,
  path: string,
  body?: unknown,
) {
  const { token, client, requestId } = createBackendClient(req.headers);
  res.setHeader("x-request-id", requestId);
  if (!token)
    return void res
      .status(401)
      .json({ code: "UNAUTHENTICATED", message: "Sign in to continue" });
  try {
    const result = await client.send(method, path, body);
    if (result.status >= 500) {
      const error = await BackendError.fromResponse(result, method, path, 0);
      logServerError({ requestId, where: "rest authoring", error });
      return void res.status(result.status).json({
        code: "BACKEND_UNAVAILABLE",
        message: "The backend service is currently unavailable",
      });
    }
    res
      .status(result.status)
      .type("application/json")
      .send(await result.text());
  } catch (error) {
    logServerError({ requestId, where: "rest authoring", error });
    res.status(502).json({
      code: "BACKEND_UNREACHABLE",
      message: "Could not reach the backend service",
    });
  }
}
