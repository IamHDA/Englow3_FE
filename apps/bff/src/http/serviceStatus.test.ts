import { afterEach, describe, expect, it, vi } from "vitest";
import { probeService } from "./serviceStatus.js";

afterEach(() => vi.unstubAllGlobals());
describe("service probes", () => {
  it("does not infer health from an HTML loading page or HTTP 200 alone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>Starting</html>")),
    );
    expect(await probeService("https://service.example/health")).toBe(
      "unavailable",
    );
  });
  it("reports missing AI configuration separately and accepts actual readiness", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ status: "UP" }));
    vi.stubGlobal("fetch", fetch);
    expect(await probeService(undefined)).toBe("unconfigured");
    expect(fetch).not.toHaveBeenCalled();
    expect(await probeService("https://service.example/health")).toBe("ready");
  });
  it("contains connection failures and never forwards credentials", async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError("Offline"));
    vi.stubGlobal("fetch", fetch);
    expect(await probeService("https://service.example/health")).toBe(
      "unavailable",
    );
    expect(fetch.mock.calls[0][1].headers).toBeUndefined();
  });
});
