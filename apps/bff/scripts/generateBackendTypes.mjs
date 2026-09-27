// Wraps the openapi-typescript CLI so the backend URL comes from BACKEND_URL
// (same variable and default the app itself reads, see config/env.ts) instead
// of being hardcoded to localhost - there's a deployed backend too, not just
// a local one.
import { execFileSync } from "node:child_process";

// Parsed, not just read: `shell: true` below hands this string to cmd.exe/sh,
// so anything other than a well-formed URL could break out into a second
// shell command.
const specUrl = new URL(
  "/v3/api-docs",
  process.env.BACKEND_URL ?? "http://localhost:8080",
);

// ponytail: shell: true is what lets Windows resolve the node_modules/.bin
// shim; Node warns because that generally implies string-concatenated argv,
// but the argument above is a parsed URL, not a raw string, so there is
// nothing left for a shell to break out through.
execFileSync(
  "openapi-typescript",
  [specUrl.href, "-o", "src/generated/backend-openapi.ts"],
  {
    stdio: "inherit",
    shell: true,
  },
);
