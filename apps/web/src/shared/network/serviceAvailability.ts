export type Availability = "unknown" | "ready" | "unavailable" | "unconfigured";
export type AvailabilitySnapshot = {
  backend: Availability;
  ai: Availability;
  checking: boolean;
  exhausted: boolean;
};
const initial: AvailabilitySnapshot = {
  backend: "unknown",
  ai: "unknown",
  checking: false,
  exhausted: false,
};
let snapshot = initial;
const listeners = new Set<() => void>();
const recovered = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let controller: AbortController | undefined;
let mounted = 0;
let generation = 0;
let startedAt = 0;
let delay = 2000;
let failed = false;
// The observed testing startup exceeds four minutes. Keep recovery bounded,
// but long enough to receive readiness without requiring another refresh.
const RECOVERY_BUDGET_MS = 6 * 60_000;
const MAX_PROBE_DELAY_MS = 10_000;

function publish(next: Partial<AvailabilitySnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}
export const serviceSnapshot = () => snapshot;
export const serverServiceSnapshot = () => initial;
export const subscribeServices = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const onBackendRecovered = (listener: () => void) => {
  recovered.add(listener);
  return () => {
    recovered.delete(listener);
  };
};

async function check(version: number) {
  if (!mounted || version !== generation) return;
  if (Date.now() - startedAt >= RECOVERY_BUDGET_MS) {
    publish({ checking: false, exhausted: true });
    return;
  }
  if (!navigator.onLine || document.visibilityState === "hidden") {
    timer = setTimeout(() => void check(version), 10_000);
    return;
  }
  const attempt = new AbortController();
  controller = attempt;
  const timeout = setTimeout(() => attempt.abort(), 6000);
  let retryAfter = 0;
  try {
    const response = await fetch("/api/system/status", {
      cache: "no-store",
      signal: attempt.signal,
    });
    if (response.status === 429)
      retryAfter =
        Math.max(10, Number(response.headers.get("retry-after")) || 60) * 1000;
    if (!response.ok) throw new Error("Unavailable");
    const value = await response.json();
    if (version !== generation) return;
    const backend = value.backend === "ready" ? "ready" : "unavailable";
    const ai =
      value.ai === "ready"
        ? "ready"
        : value.ai === "unconfigured"
          ? "unconfigured"
          : "unavailable";
    const didRecover = backend === "ready" && failed;
    failed = backend !== "ready";
    publish({
      backend,
      ai,
      checking: backend !== "ready" || ai === "unavailable",
    });
    if (didRecover) recovered.forEach((listener) => listener());
    if (backend === "ready" && ai !== "unavailable") return;
  } catch {
    if (version !== generation) return;
    failed = true;
    publish({ backend: "unavailable", checking: true });
  } finally {
    clearTimeout(timeout);
  }
  if (version !== generation) return;
  timer = setTimeout(
    () => void check(version),
    retryAfter || delay + Math.random() * 500,
  );
  delay = Math.min(delay * 2, MAX_PROBE_DELAY_MS);
}

export function retryServices() {
  if (!mounted) return;
  clearTimeout(timer);
  controller?.abort();
  startedAt = Date.now();
  delay = 2000;
  publish({ checking: true, exhausted: false });
  void check(++generation);
}

/** Signals a transport outage, never replays the failed operation. */
export function backendUnavailable() {
  failed = true;
  if (snapshot.backend === "unavailable") return;
  publish({ backend: "unavailable" });
  retryServices();
}

export function mountServiceChecks() {
  mounted += 1;
  if (mounted === 1) {
    retryServices();
    window.addEventListener("online", retryServices);
    document.addEventListener("visibilitychange", resume);
  }
  return () => {
    mounted -= 1;
    if (!mounted) {
      generation += 1;
      clearTimeout(timer);
      controller?.abort();
      window.removeEventListener("online", retryServices);
      document.removeEventListener("visibilitychange", resume);
    }
  };
}
function resume() {
  if (document.visibilityState === "visible") retryServices();
}
