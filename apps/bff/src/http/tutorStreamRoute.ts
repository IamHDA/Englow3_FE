import { Router } from "express";
import { env } from "../config/env.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A subscription only: every reconnect reads an existing reply and never calls an enqueue endpoint. */
export function tutorStreamRoute(
  backendUrl = env.backendUrl,
  fetcher: typeof fetch = fetch,
) {
  const router = Router();
  router.get(
    "/tutor/conversations/:id/messages/:messageId/events",
    async (req, res) => {
      const authorization = req.headers.authorization;
      if (!authorization || !/^Bearer \S+$/.test(authorization)) {
        res.status(401).json({ code: "UNAUTHENTICATED" });
        return;
      }
      const id = String(req.params.id),
        messageId = String(req.params.messageId);
      const cursor =
        typeof req.query.cursor === "string" ? req.query.cursor : "";
      if (!UUID.test(id) || !UUID.test(messageId) || cursor.length > 100) {
        res.status(400).json({ code: "BAD_USER_INPUT" });
        return;
      }
      const controller = new AbortController();
      const close = () => controller.abort();
      res.once("close", close);
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      try {
        const upstream = await fetcher(
          `${backendUrl.replace(/\/$/, "")}/api/tutor/conversations/${id}/messages/${messageId}/events?${new URLSearchParams({ cursor })}`,
          {
            headers: {
              authorization,
              accept: "text/event-stream",
              "x-request-id": crypto.randomUUID(),
            },
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(52_000),
            ]),
          },
        );
        res.status(upstream.status);
        res.setHeader(
          "Content-Type",
          upstream.headers.get("content-type") ?? "application/json",
        );
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();
        if (!upstream.body) {
          res.end();
          return;
        }
        reader = upstream.body.getReader();
        while (!res.destroyed) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.write(Buffer.from(value)))
            await new Promise<void>((resolve) => {
              const ready = () => {
                res.off("drain", ready);
                res.off("close", ready);
                resolve();
              };
              res.once("drain", ready);
              res.once("close", ready);
            });
        }
        res.end();
      } catch {
        if (!res.headersSent)
          res.status(502).json({ code: "BACKEND_UNAVAILABLE" });
        else res.end();
      } finally {
        res.off("close", close);
        controller.abort();
        await reader?.cancel().catch(() => undefined);
        reader?.releaseLock();
      }
    },
  );
  return router;
}
