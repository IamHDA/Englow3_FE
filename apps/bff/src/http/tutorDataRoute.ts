import { Router } from "express";
import { env } from "../config/env.js";
const KINDS = [
  "CONVERSATIONS",
  "MESSAGES",
  "VERSIONS",
  "REPORTS",
  "RECORDINGS",
  "MEMORY",
];
export function tutorDataRoute(
  backendUrl = env.backendUrl,
  fetcher: typeof fetch = fetch,
) {
  const router = Router();
  router.all("/tutor/data", async (req, res) => {
    if (
      !req.headers.authorization ||
      !/^Bearer \S+$/.test(req.headers.authorization)
    ) {
      res.status(401).json({ code: "UNAUTHENTICATED" });
      return;
    }
    if (!["GET", "DELETE"].includes(req.method)) {
      res.status(405).end();
      return;
    }
    const kind = String(req.query.kind ?? "");
    const page = String(req.query.page ?? "0");
    if (
      req.method === "GET" &&
      (!KINDS.includes(kind) ||
        !/^\d{1,6}$/.test(page) ||
        Number(page) > 100000)
    ) {
      res.status(400).json({ code: "BAD_USER_INPUT" });
      return;
    }
    const suffix =
      req.method === "GET"
        ? `/export?${new URLSearchParams({ kind, page })}`
        : "";
    try {
      const response = await fetcher(
        `${backendUrl.replace(/\/$/, "")}/api/tutor/data${suffix}`,
        {
          method: req.method,
          headers: {
            authorization: req.headers.authorization,
            "x-request-id": crypto.randomUUID(),
          },
          signal: AbortSignal.timeout(30_000),
        },
      );
      res.status(response.status).set("Cache-Control", "no-store");
      if (response.status === 202 || response.status === 204) res.end();
      else res.type("json").send(await response.text());
    } catch {
      res.status(502).json({ code: "BACKEND_UNAVAILABLE" });
    }
  });
  return router;
}
