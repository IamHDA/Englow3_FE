import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("service recovery", () => {
  it("probes once per tab and publishes recovery without replaying mutations", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ backend: "unavailable", ai: "unavailable" }),
        )
        .mockResolvedValueOnce(
          Response.json({ backend: "ready", ai: "ready" }),
        ),
    );
    const services = await import("./serviceAvailability");
    const listener = vi.fn();
    const unsub = services.onBackendRecovered(listener);
    const stop = services.mountServiceChecks();
    const stopSecond = services.mountServiceChecks();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3000);
    expect(services.serviceSnapshot().backend).toBe("ready");
    expect(listener).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(fetch).toHaveBeenCalledTimes(2);
    stop();
    stopSecond();
    unsub();
  });
  it("stops automatic recovery after its budget and allows an explicit retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Offline")));
    const services = await import("./serviceAvailability");
    const stop = services.mountServiceChecks();
    await vi.advanceTimersByTimeAsync(380_000);
    expect(services.serviceSnapshot().exhausted).toBe(true);
    const count = vi.mocked(fetch).mock.calls.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(fetch).toHaveBeenCalledTimes(count);
    services.retryServices();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(count + 1);
    stop();
  });
  it("recovers after a cold start longer than two minutes without replaying operations", async () => {
    const start = Date.now();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          Response.json({
            backend: Date.now() - start >= 250_000 ? "ready" : "unavailable",
            ai: "unconfigured",
          }),
        ),
      ),
    );
    const services = await import("./serviceAvailability");
    const listener = vi.fn();
    const unsubscribe = services.onBackendRecovered(listener);
    const stop = services.mountServiceChecks();
    await vi.advanceTimersByTimeAsync(140_000);
    expect(services.serviceSnapshot().exhausted).toBe(false);
    expect(listener).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(140_000);
    expect(services.serviceSnapshot().backend).toBe("ready");
    expect(listener).toHaveBeenCalledOnce();
    expect(
      vi
        .mocked(fetch)
        .mock.calls.every(([url]) => url === "/api/system/status"),
    ).toBe(true);
    stop();
    unsubscribe();
  });
});
