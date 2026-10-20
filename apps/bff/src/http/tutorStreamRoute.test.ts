import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { tutorStreamRoute } from "./tutorStreamRoute.js";
let server: Server;
const id = "fe5e8d82-22ec-44eb-a71c-6b82c66c9d37";
async function start(fetcher: typeof fetch) {
  const app = express();
  app.use(tutorStreamRoute("https://backend.invalid", fetcher));
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}/tutor/conversations/${id}/messages/${id}/events`;
}
afterEach(() => server?.close());
it("authenticates and validates before opening a subscription", async () => {
  const fetcher = vi.fn();
  const url = await start(fetcher);
  expect((await fetch(url)).status).toBe(401);
  expect(
    (
      await fetch(`${url}?cursor=${"x".repeat(101)}`, {
        headers: { authorization: "Bearer test" },
      })
    ).status,
  ).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("passes SSE frames and cursor without creating a generation", async () => {
  const frames =
    "id: 0:epoch:5\nevent: delta\ndata: hello\n\nevent: done\ndata: {}\n\n";
  const fetcher = vi.fn().mockResolvedValue(
    new Response(frames, {
      headers: { "content-type": "text/event-stream" },
    }),
  );
  const url = await start(fetcher);
  const response = await fetch(`${url}?cursor=0%3Aepoch%3A0`, {
    headers: { authorization: "Bearer test" },
  });
  expect(await response.text()).toBe(frames);
  expect(response.headers.get("cache-control")).toContain("no-transform");
  expect(fetcher.mock.calls[0][0]).toContain("cursor=0%3Aepoch%3A0");
  expect(fetcher.mock.calls[0][1].method).toBeUndefined();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
