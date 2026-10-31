import { afterEach, describe, expect, it, vi } from "vitest";
import { readTutorStream } from "./tutorStream";

afterEach(() => vi.unstubAllGlobals());
describe("Tutor SSE replay parser", () => {
  it("handles UTF-8 and CRLF split across network chunks", async () => {
    const text =
      'event: reset\r\ndata: {"type":"reset","id":"0:-:0","delta":""}\r\n\r\nevent: delta\r\ndata: {"type":"delta","id":"0:-:2","delta":"âm"}\r\n\r\n';
    const bytes = new TextEncoder().encode(text);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              for (let i = 0; i < bytes.length; i += 2)
                controller.enqueue(bytes.slice(i, i + 2));
              controller.close();
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        ),
      ),
    );
    const events: unknown[] = [];
    expect(
      await readTutorStream(
        "c",
        "m",
        "",
        new AbortController().signal,
        (event) => events.push(event),
      ),
    ).toBe(false);
    expect(events).toEqual([
      { type: "reset", id: "0:-:0", delta: "" },
      { type: "delta", id: "0:-:2", delta: "âm" },
    ]);
    expect(String(vi.mocked(fetch).mock.calls[0][0])).not.toContain("token");
  });
  it("rejects a non-streaming error so the hook can use polling", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })),
    );
    await expect(
      readTutorStream("c", "m", "", new AbortController().signal, () => {}),
    ).rejects.toThrow("Stream unavailable");
  });
});
