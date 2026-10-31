import { probeServices } from "@/server/serviceStatus";
import {
  clientKey,
  createRateLimiter,
  tooManyRequests,
} from "@/server/rateLimit";

export const dynamic = "force-dynamic";
const allow = createRateLimiter({ windowMs: 60_000, max: 60 });

export async function GET(request: Request) {
  if (!allow(clientKey(request))) return tooManyRequests();
  return Response.json(await probeServices(), {
    headers: { "cache-control": "no-store" },
  });
}
