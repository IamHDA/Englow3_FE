import express, { type Request, type Response, type Router } from "express";

import { createBackendClient } from "../shared/http/backendClient.js";
import { BackendError } from "../shared/http/backendError.js";
import { logServerError } from "../shared/http/logServerError.js";

/**
 * The largest batch that will be forwarded.
 *
 * Matches the backend's own ceiling of five thousand cards, which lands around
 * this size. Stated here as well so a file that could never be accepted is
 * refused before it crosses the network twice.
 */
const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

/**
 * Content import, over REST rather than GraphQL.
 *
 * A generated batch is a multi-megabyte file on someone's disk. Pushing it
 * through a GraphQL mutation would mean holding it in a JSON string inside a
 * document, past a body cap set for documents that are measured in kilobytes -
 * so the cap would have to be raised for every query to accommodate one upload.
 * A file upload is the one thing GraphQL is a poor shape for, and this is the
 * exception rather than the start of a second API: it forwards the body and
 * reads nothing out of it.
 */
export function importRoute(): Router {
  const router = express.Router();

  router.post(
    "/admin/flashcards/import/validate",
    express.text({ type: "*/*", limit: MAX_IMPORT_BYTES }),
    (req, res) => forward(req, res, "/api/admin/flashcards/import/validate"),
  );

  router.post(
    "/admin/flashcards/sets/:id/import",
    express.text({ type: "*/*", limit: MAX_IMPORT_BYTES }),
    (req, res) =>
      forward(
        req,
        res,
        `/api/admin/flashcards/sets/${encodeURIComponent(req.params.id)}/import`,
      ),
  );

  router.post(
    "/admin/dictation/import/validate",
    express.text({ type: "*/*", limit: MAX_IMPORT_BYTES }),
    (req, res) => forward(req, res, "/api/admin/dictation/import/validate"),
  );

  // No set id: a shadowing batch creates its own lessons, one per clip.
  router.post(
    "/admin/dictation/import",
    express.text({ type: "*/*", limit: MAX_IMPORT_BYTES }),
    (req, res) => forward(req, res, "/api/admin/dictation/import"),
  );

  return router;
}

/**
 * Sends the file on as multipart, which is what the backend's endpoint takes.
 *
 * The learner's token rides along with no more than a check that one is there:
 * authorisation is the backend's to decide, and a BFF that checked the role
 * itself would be a second place for that answer to be wrong.
 */
async function forward(req: Request, res: Response, path: string) {
  const { token, requestId, client } = createBackendClient(req.headers);
  if (!token) {
    res.status(401).json({ code: "UNAUTHENTICATED", message: "Missing token" });
    return;
  }

  const form = new FormData();
  form.append(
    "file",
    new Blob([typeof req.body === "string" ? req.body : ""], {
      type: "application/json",
    }),
    "import.json",
  );

  const where = `rest ${req.baseUrl}${req.path}`;
  try {
    const response = await client.send("POST", path, form);

    // A 5xx is the backend failing, not the file being refused: its body is a
    // server's own account of what broke, which is for the log and not the
    // author. The trace id is kept so the two sides can be lined up.
    if (response.status >= 500) {
      const failure = await BackendError.fromResponse(response);
      logServerError({ requestId, where, error: failure });
      res.status(response.status).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        traceId: failure.traceId,
      });
      return;
    }

    // Anything else is passed through as the backend wrote it, including on a
    // refusal: its rejection report is the whole point of the endpoint, and
    // summarising it here would lose the rows an author needs to fix.
    res
      .status(response.status)
      .type("application/json")
      .send(await response.text());
  } catch (error) {
    logServerError({ requestId, where, error });
    res.status(502).json({
      code: "BACKEND_UNREACHABLE",
      message: "Could not reach the backend service",
    });
  }
}
