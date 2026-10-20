import { expect, it, vi } from "vitest";
import { TutorApi } from "./tutor.api.js";
import type { BackendClient } from "../../shared/http/backendClient.js";
it("does not advertise context or memory support when the older backend omits capabilities", async () => {
  const client = {
    get: vi.fn().mockResolvedValue({ enabled: true, remaining: 4 }),
  } as unknown as BackendClient;
  const usage = await new TutorApi(client).getUsage();
  expect(usage.supportedContexts).toEqual([]);
  expect(usage.memorySupported).toBe(false);
});
it("preserves explicit capabilities from the deployed backend", async () => {
  const client = {
    get: vi.fn().mockResolvedValue({
      enabled: true,
      supportedContexts: ["QUIZ", "ASSESSMENT", "EXAM"],
      memorySupported: true,
    }),
  } as unknown as BackendClient;
  const usage = await new TutorApi(client).getUsage();
  expect(usage.supportedContexts).toContain("ASSESSMENT");
  expect(usage.memorySupported).toBe(true);
});

it("accepts an empty 204 response when clearing derived memory", async () => {
  const send = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  expect(
    await new TutorApi({ send } as unknown as BackendClient).clearMemory(
      "owned",
    ),
  ).toBe(true);
  expect(send).toHaveBeenCalledWith(
    "DELETE",
    "/api/tutor/conversations/owned/memory",
  );
});
it("does not turn an ownership refusal into a successful clear", async () => {
  const send = vi.fn().mockResolvedValue(
    Response.json(
      {
        code: "TUTOR_CONVERSATION_NOT_FOUND",
        message: "Conversation not found",
      },
      { status: 404 },
    ),
  );
  await expect(
    new TutorApi({ send } as unknown as BackendClient).clearMemory("other"),
  ).rejects.toMatchObject({
    status: 404,
    code: "TUTOR_CONVERSATION_NOT_FOUND",
  });
});
