import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, expect, it } from "vitest";

import { createApp } from "./app.js";

let server: Server;
let base: string;

beforeAll(async () => {
  const app = await createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

// The drift this guards against: `/rest` was mounted by the local server only,
// so an import that worked in development had nowhere to land once deployed.
it("serves GraphQL and REST from the one app both entry points use", async () => {
  const graphql = await fetch(`${base}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "{ health }" }),
  });
  expect(await graphql.json()).toEqual({ data: { health: "ok" } });
  expect(graphql.headers.get("x-request-id")).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );

  // Refused by the route itself for want of a token, so no backend is reached.
  const rest = await fetch(`${base}/rest/admin/flashcards/import/validate`, {
    method: "POST",
    body: "[]",
  });
  expect(rest.status).toBe(401);

  expect((await fetch(`${base}/nowhere`)).status).toBe(404);
});
