import { Router } from "express";

export type ServiceState = "ready" | "unavailable" | "unconfigured";

/** Probes do not authenticate users or call a paid inference endpoint. */
export async function probeService(
  url: string | undefined,
): Promise<ServiceState> {
  if (!url) return "unconfigured";
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) return "unavailable";
    const body = (await response.json()) as { status?: string };
    return body.status === "UP" || body.status === "up"
      ? "ready"
      : "unavailable";
  } catch {
    return "unavailable";
  }
}

export function serviceStatusRoute(backendUrl: string, aiHealthUrl?: string) {
  const route = Router();
  let pending: Promise<{ backend: ServiceState; ai: ServiceState }> | undefined;
  let completedAt = 0;
  route.get("/status", async (_request, response) => {
    // Best effort coalescing per instance; never a global/distributed lock.
    if (!pending || Date.now() - completedAt > 2000) {
      completedAt = Infinity;
      pending = Promise.all([
        probeService(
          `${backendUrl.replace(/\/$/, "")}/actuator/health/readiness`,
        ),
        probeService(aiHealthUrl),
      ]).then(([backend, ai]) => {
        completedAt = Date.now();
        return { backend, ai };
      });
    }
    response.set("Cache-Control", "no-store").json(await pending);
  });
  return route;
}
