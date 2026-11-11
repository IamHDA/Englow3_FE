import { afterEach, expect, it, vi } from "vitest";
import { roleHistory, searchUsers } from "@/features/admin/api/users";
import { scoreConversions } from "@/features/exam/api/scoreConversions";
import { refuseCrossSite } from "./csrf";

afterEach(() => vi.unstubAllGlobals());

it.each([
  ["user search", (signal: AbortSignal) => searchUsers("", "", 0, signal)],
  ["role history", (signal: AbortSignal) => roleHistory("user-id", signal)],
  ["score conversions", scoreConversions],
] as const)(
  "allows the %s client through the web proxy security check",
  async (_name, read) => {
    const fetcher = vi.fn(async (path: string, init: RequestInit) => {
      const refusal = refuseCrossSite(
        new Request(new URL(path, "https://englow.test"), init),
      );
      if (refusal) return refusal;
      return Response.json(
        path.includes("?")
          ? { items: [], page: 0, totalPages: 0, totalItems: 0 }
          : [],
      );
    });
    vi.stubGlobal("fetch", fetcher);
    await expect(read(new AbortController().signal)).resolves.toBeDefined();
    expect(fetcher).toHaveBeenCalledOnce();
  },
);
