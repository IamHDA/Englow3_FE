import { afterEach, describe, expect, it, vi } from "vitest";

const captureException = vi.fn();
const init = vi.fn();
vi.mock("@sentry/node", () => ({
  init: (...args: unknown[]) => init(...args),
  captureException: (...args: unknown[]) => captureException(...args),
}));

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  captureException.mockReset();
  init.mockReset();
});

async function load() {
  return await import("./errorReporting.js");
}

describe("error reporting", () => {
  it("does nothing without a DSN", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    const { initErrorReporting, reportError } = await load();

    initErrorReporting();
    reportError(new Error("boom"), { requestId: "r1", where: "test" });

    expect(init).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it("starts once, with no personal data attached", async () => {
    vi.stubEnv("SENTRY_DSN", "https://key@example.ingest.sentry.io/1");
    const { initErrorReporting } = await load();

    initErrorReporting();
    initErrorReporting();

    expect(init).toHaveBeenCalledTimes(1);
    expect(init.mock.calls[0][0]).toMatchObject({
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
  });

  it("reports a failure the client could not be told about", async () => {
    vi.stubEnv("SENTRY_DSN", "https://key@example.ingest.sentry.io/1");
    const { initErrorReporting, reportError } = await load();
    initErrorReporting();
    const error = new TypeError("resolver bug");

    reportError(error, { requestId: "r1", where: "graphql" });

    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { where: "graphql", requestId: "r1" },
    });
  });

  it("does not report a refusal the caller caused", async () => {
    vi.stubEnv("SENTRY_DSN", "https://key@example.ingest.sentry.io/1");
    const { initErrorReporting, reportError } = await load();
    // Loaded after the reset, like the module under test: a class from before it
    // is a different class, and `instanceof` would never match.
    const { BackendError } = await import("../shared/http/backendError.js");
    initErrorReporting();

    reportError(new BackendError("conflict", 409, "CONFLICT"), {
      requestId: "r1",
      where: "graphql",
    });

    expect(captureException).not.toHaveBeenCalled();
  });
});
