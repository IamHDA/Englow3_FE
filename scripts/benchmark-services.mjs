import { performance } from "node:perf_hooks";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (index % 2 === 0) pairs.push([value.replace(/^--/, ""), all[index + 1]]);
    return pairs;
  }, []),
);
const rounds = Math.max(1, Math.min(100, Number(args.rounds) || 30));
const endpoints = [
  ["web", args.web && new URL("/", args.web).href],
  ["bff-readiness", args.bff && new URL("/system/status", args.bff).href],
  [
    "backend-readiness",
    args.backend && new URL("/actuator/health/readiness", args.backend).href,
  ],
].filter(([, url]) => url);
if (!endpoints.length)
  throw new Error("Use --web URL --bff URL --backend URL [--rounds 30]");
const results = [];
for (let round = 1; round <= rounds; round++) {
  results.push(
    ...(await Promise.all(
      endpoints.map(async ([service, url]) => {
        const start = performance.now();
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(25_000),
            cache: "no-store",
          });
          await response.arrayBuffer();
          return {
            service,
            round,
            status: response.status,
            durationMs: Math.round(performance.now() - start),
            ok: response.ok,
          };
        } catch (error) {
          return {
            service,
            round,
            durationMs: Math.round(performance.now() - start),
            ok: false,
            error: error.name,
          };
        }
      }),
    )),
  );
}
const summary = endpoints.map(([service]) => {
  const samples = results.filter((row) => row.service === service);
  const durations = samples
    .filter((row) => row.ok)
    .map((row) => row.durationMs)
    .sort((a, b) => a - b);
  const percentile = (p) =>
    durations.length ? durations[Math.ceil(durations.length * p) - 1] : null;
  return {
    service,
    samples: samples.length,
    failures: samples.filter((row) => !row.ok).length,
    p50Ms: percentile(0.5),
    p95Ms: durations.length >= 20 ? percentile(0.95) : null,
    maxMs: durations.at(-1) ?? null,
  };
});
console.log(
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      label: args.label || "unspecified; classify warm/cold explicitly",
      rounds,
      summary,
      results,
    },
    null,
    2,
  ),
);
if (results.some((row) => !row.ok)) process.exitCode = 1;
