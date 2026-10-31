"use client";

import { z } from "zod";

// zod compiles schemas to faster code with `new Function`, after probing
// whether the page allows it. This site's Content-Security-Policy does not
// allow it (no 'unsafe-eval'), so the probe fails, is caught, and the schema
// runs the ordinary way - but the browser reports every such probe as a policy
// violation, which buries the real ones. Saying so up front skips the probe;
// form schemas are small, so nothing measurable is lost.
//
// At module level rather than in an effect: it has to be in place before the
// first schema is created, and that happens during the first render.
z.config({ jitless: true });

/** Mounted once in the root layout; renders nothing. */
export function JitlessZod() {
  return null;
}
