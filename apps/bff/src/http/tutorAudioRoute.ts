import express, { Router } from "express";
import { env } from "../config/env.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 2_100_000;

/** Bounded private upload; provider work is queued by BE and never runs in this request. */
export function tutorAudioRoute(
  backendUrl = env.backendUrl,
  fetcher: typeof fetch = fetch,
) {
  const router = Router();
  router.use("/tutor/recordings", (req, res, next) => {
    if (
      !req.headers.authorization ||
      !/^Bearer \S+$/.test(req.headers.authorization)
    ) {
      res.status(401).json({ code: "UNAUTHENTICATED" });
      return;
    }
    next();
  });
  async function forward(
    req: express.Request,
    res: express.Response,
    path: string,
    body?: Buffer,
  ) {
    try {
      const upstream = await fetcher(
        `${backendUrl.replace(/\/$/, "")}/api/tutor/recordings${path}`,
        {
          method: req.method,
          headers: {
            authorization: req.headers.authorization!,
            "content-type": "audio/wav",
            "x-request-id": crypto.randomUUID(),
          },
          body: body as unknown as BodyInit | undefined,
          signal: AbortSignal.timeout(45_000),
        },
      );
      res.status(upstream.status).set("Cache-Control", "no-store");
      if (upstream.status === 204) {
        res.end();
        return;
      }
      res.type("application/json").send(await upstream.text());
    } catch {
      res.status(502).json({ code: "BACKEND_UNAVAILABLE" });
    }
  }
  router.post(
    "/tutor/recordings",
    express.raw({ type: "audio/wav", limit: MAX_BYTES }),
    async (req, res) => {
      const clientId =
        typeof req.query.clientMessageId === "string"
          ? req.query.clientMessageId
          : "";
      const locale = req.query.locale ?? "en-US";
      if (
        !UUID.test(clientId) ||
        !["en-US", "vi-VN"].includes(String(locale)) ||
        !Buffer.isBuffer(req.body)
      ) {
        res.status(400).json({ code: "BAD_USER_INPUT" });
        return;
      }
      await forward(
        req,
        res,
        `?${new URLSearchParams({ clientMessageId: clientId, locale: String(locale) })}`,
        req.body,
      );
    },
  );
  router.get("/tutor/recordings/requests/:id", async (req, res) => {
    const id = String(req.params.id);
    if (!UUID.test(id)) {
      res.status(400).json({ code: "BAD_USER_INPUT" });
      return;
    }
    await forward(req, res, `/requests/${id}`);
  });
  router.delete("/tutor/recordings/:id", async (req, res) => {
    const id = String(req.params.id);
    if (!UUID.test(id)) {
      res.status(400).json({ code: "BAD_USER_INPUT" });
      return;
    }
    await forward(req, res, `/${id}`);
  });
  router.use(
    (
      error: { type?: string },
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (error.type === "entity.too.large")
        res.status(413).json({ code: "TUTOR_AUDIO_TOO_LARGE" });
      else next(error);
    },
  );
  return router;
}
