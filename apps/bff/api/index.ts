import type { Request, Response } from "express";

import { createApp } from "../src/app.js";

// One promise, created when the instance loads: two requests arriving together
// on a cold start both wait on the same start() instead of each calling it.
const app = createApp();

export default async function handler(req: Request, res: Response) {
  return (await app)(req, res);
}
