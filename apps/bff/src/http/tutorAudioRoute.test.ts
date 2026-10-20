import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { tutorAudioRoute } from "./tutorAudioRoute.js";

let server: Server;
const id = "fe5e8d82-22ec-44eb-a71c-6b82c66c9d37";
async function start(fetcher: typeof fetch) {
  const app = express();
  app.use(tutorAudioRoute("https://backend.invalid", fetcher));
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}
afterEach(() => server?.close());

it("refuses unauthenticated audio before buffering or calling backend", async () => {
  const fetcher = vi.fn();
  const url = await start(fetcher);
  const response = await fetch(
    `${url}/tutor/recordings?clientMessageId=${id}`,
    {
      method: "POST",
      headers: { "content-type": "audio/wav" },
      body: new Uint8Array(100),
    },
  );
  expect(response.status).toBe(401);
  expect(fetcher).not.toHaveBeenCalled();
});
it("bounds the raw body and rejects oversized audio", async () => {
  const fetcher = vi.fn();
  const url = await start(fetcher);
  const response = await fetch(
    `${url}/tutor/recordings?clientMessageId=${id}`,
    {
      method: "POST",
      headers: { authorization: "Bearer test", "content-type": "audio/wav" },
      body: new Uint8Array(2_100_001),
    },
  );
  expect(response.status).toBe(413);
  expect(fetcher).not.toHaveBeenCalled();
});
it("forwards immutable upload identity and returns a queued receipt", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ id, status: "QUEUED" }));
  const url = await start(fetcher);
  const response = await fetch(
    `${url}/tutor/recordings?clientMessageId=${id}&locale=vi-VN`,
    {
      method: "POST",
      headers: { authorization: "Bearer test", "content-type": "audio/wav" },
      body: new Uint8Array(44),
    },
  );
  expect(response.status).toBe(200);
  expect(fetcher.mock.calls[0][0]).toBe(
    `https://backend.invalid/api/tutor/recordings?clientMessageId=${id}&locale=vi-VN`,
  );
  expect(fetcher.mock.calls[0][1].headers.authorization).toBe("Bearer test");
  expect((await response.json()).status).toBe("QUEUED");
});
it("preserves ownership refusals from backend and validates receipt IDs", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(Response.json({ code: "NOT_FOUND" }, { status: 404 }));
  const url = await start(fetcher);
  expect(
    (
      await fetch(`${url}/tutor/recordings/requests/${id}`, {
        headers: { authorization: "Bearer test" },
      })
    ).status,
  ).toBe(404);
  expect(
    (
      await fetch(`${url}/tutor/recordings/requests/invalid`, {
        headers: { authorization: "Bearer test" },
      })
    ).status,
  ).toBe(400);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
