import express, { Router, type Response } from "express";

import { env } from "../config/env.js";

const BEARER = /^Bearer \S+$/;
const PERIODS = ["MONTHLY", "YEARLY"];
const MAX_GRANT_DAYS = 3650;

/** The longest an email address can be (RFC 5321), so a confirmation cannot be used to push a large body through. */
const MAX_EMAIL_LENGTH = 254;

/**
 * A person's own account over REST: a copy of their data, its erasure, their
 * plan, and the public price list.
 *
 * REST rather than GraphQL because two of these answer with a file or with no
 * body at all, and because none of them is something the Apollo cache should
 * ever hold - an export that lingered in a cache would be the learner's whole
 * history sitting in browser memory.
 */
export function accountRoute(
  backendUrl = env.backendUrl,
  fetcher: typeof fetch = fetch,
) {
  const router = Router();
  const base = backendUrl.replace(/\/$/, "");

  async function relay(
    res: Response,
    path: string,
    init: {
      method: string;
      authorization?: string;
      body?: string;
      timeoutMs: number;
    },
  ) {
    try {
      const upstream = await fetcher(`${base}${path}`, {
        method: init.method,
        headers: {
          ...(init.authorization ? { authorization: init.authorization } : {}),
          ...(init.body ? { "content-type": "application/json" } : {}),
          "x-request-id": crypto.randomUUID(),
        },
        body: init.body,
        signal: AbortSignal.timeout(init.timeoutMs),
      });
      res.status(upstream.status).set("Cache-Control", "no-store");
      if (upstream.status === 204) {
        res.end();
        return;
      }
      res
        .type(upstream.headers.get("content-type") ?? "application/json")
        .send(await upstream.text());
    } catch {
      res.status(502).json({ code: "BACKEND_UNAVAILABLE" });
    }
  }

  /** Signed-in only: the backend would refuse too, but a missing header is not worth a round trip. */
  function signedIn(req: express.Request, res: Response): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization || !BEARER.test(authorization)) {
      res.status(401).json({ code: "UNAUTHENTICATED" });
      return undefined;
    }
    return authorization;
  }

  // Public: the pricing page reads this before anyone has an account.
  router.get("/plans", async (_req, res) => {
    await relay(res, "/api/plans", { method: "GET", timeoutMs: 10_000 });
  });

  router.get("/account/subscription", async (req, res) => {
    const authorization = signedIn(req, res);
    if (!authorization) return;
    await relay(res, "/api/user/me/subscription", {
      method: "GET",
      authorization,
      timeoutMs: 15_000,
    });
  });

  router.get("/account/export", async (req, res) => {
    const authorization = signedIn(req, res);
    if (!authorization) return;
    // Gathering a long history from a dozen tables is the slowest thing the
    // backend does for one person; give it room rather than failing the
    // learner who has used the product the most.
    await relay(res, "/api/user/me/export", {
      method: "GET",
      authorization,
      timeoutMs: 55_000,
    });
  });

  router.post(
    "/account/erase",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      const authorization = signedIn(req, res);
      if (!authorization) return;
      const confirmEmail: unknown = req.body?.confirmEmail;
      if (
        typeof confirmEmail !== "string" ||
        confirmEmail.trim() === "" ||
        confirmEmail.length > MAX_EMAIL_LENGTH
      ) {
        res.status(400).json({ code: "BAD_USER_INPUT" });
        return;
      }
      await relay(res, "/api/user/me/erase", {
        method: "POST",
        authorization,
        body: JSON.stringify({ confirmEmail }),
        timeoutMs: 30_000,
      });
    },
  );

  // Administrators put a learner on the paid plan by hand until a payment
  // provider is connected. The backend checks the ADMIN role on every call;
  // what is checked here is only that the request is well formed.
  router.put(
    "/admin/subscriptions",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      const authorization = signedIn(req, res);
      if (!authorization) return;
      const { email, billingPeriod, days } = req.body ?? {};
      if (
        typeof email !== "string" ||
        email.trim() === "" ||
        email.length > MAX_EMAIL_LENGTH ||
        !PERIODS.includes(billingPeriod) ||
        !Number.isInteger(days) ||
        days < 1 ||
        days > MAX_GRANT_DAYS
      ) {
        res.status(400).json({ code: "BAD_USER_INPUT" });
        return;
      }
      await relay(res, "/api/admin/subscriptions", {
        method: "PUT",
        authorization,
        body: JSON.stringify({ email: email.trim(), billingPeriod, days }),
        timeoutMs: 15_000,
      });
    },
  );

  // A POST rather than a DELETE: the web route that fronts this carries a
  // body but not a query string, and the email has to travel somewhere.
  router.post(
    "/admin/subscriptions/revoke",
    express.json({ limit: "2kb" }),
    async (req, res) => {
      const authorization = signedIn(req, res);
      if (!authorization) return;
      const email: unknown = req.body?.email;
      if (
        typeof email !== "string" ||
        email.trim() === "" ||
        email.length > MAX_EMAIL_LENGTH
      ) {
        res.status(400).json({ code: "BAD_USER_INPUT" });
        return;
      }
      await relay(
        res,
        `/api/admin/subscriptions?${new URLSearchParams({ email: email.trim() })}`,
        { method: "DELETE", authorization, timeoutMs: 15_000 },
      );
    },
  );

  return router;
}
