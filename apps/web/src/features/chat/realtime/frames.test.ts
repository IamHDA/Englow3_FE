import { describe, expect, it } from "vitest";

import { FRAME_TYPE, parseFrame, typingPayload } from "./frames";

const message = {
  id: "m1",
  conversationId: "c1",
  seq: 7,
  senderId: "u2",
  body: "hi",
  imageUrl: null,
  recalled: false,
  sentAt: "2026-11-16T03:15:58.123456Z",
  clientId: null,
};

describe("parseFrame", () => {
  it("reads a new message in the shape of the REST answer", () => {
    expect(parseFrame(JSON.stringify({ type: "message", message }))).toEqual({
      type: FRAME_TYPE.message,
      message,
    });
  });

  it("turns a missing nullable field into null, and drops fields it does not know", () => {
    const bare: Record<string, unknown> = { ...message };
    delete bare.clientId;
    delete bare.imageUrl;
    const frame = parseFrame(
      JSON.stringify({ type: "message", message: { ...bare, extra: 1 } }),
    );

    expect(frame).toEqual({
      type: FRAME_TYPE.message,
      message: { ...message, imageUrl: null, clientId: null },
    });
  });

  it("reads a message from a deleted user, which has no sender", () => {
    const frame = parseFrame(
      JSON.stringify({
        type: "message",
        message: { ...message, senderId: null },
      }),
    );

    expect(frame).toMatchObject({ message: { senderId: null } });
  });

  it("reads recalled, read and typing frames", () => {
    expect(
      parseFrame(
        '{"type":"recalled","conversationId":"c1","messageId":"m1","seq":7}',
      ),
    ).toEqual({
      type: FRAME_TYPE.recalled,
      conversationId: "c1",
      messageId: "m1",
      seq: 7,
    });
    expect(
      parseFrame(
        '{"type":"read","conversationId":"c1","userId":"u2","upToSeq":9}',
      ),
    ).toEqual({
      type: FRAME_TYPE.read,
      conversationId: "c1",
      userId: "u2",
      upToSeq: 9,
    });
    expect(
      parseFrame(
        '{"type":"typing","conversationId":"c1","userId":"u2","active":false}',
      ),
    ).toEqual({
      type: FRAME_TYPE.typing,
      conversationId: "c1",
      userId: "u2",
      active: false,
    });
  });

  it.each([
    ["not JSON", "{oops"],
    ["JSON that is not an object", "[1,2]"],
    ["null", "null"],
    ["a type nobody knows", '{"type":"presence"}'],
    ["no type", '{"conversationId":"c1"}'],
    ["a message without its message", '{"type":"message"}'],
    [
      "a message whose seq is not a number",
      JSON.stringify({ type: "message", message: { ...message, seq: "7" } }),
    ],
    [
      "a message whose recalled is not a boolean",
      JSON.stringify({ type: "message", message: { ...message, recalled: 0 } }),
    ],
    [
      "a message whose body is a number",
      JSON.stringify({ type: "message", message: { ...message, body: 5 } }),
    ],
    [
      "a recalled frame with no message id",
      '{"type":"recalled","conversationId":"c1","seq":1}',
    ],
    [
      "a read frame with a text seq",
      '{"type":"read","conversationId":"c1","userId":"u","upToSeq":"1"}',
    ],
    [
      "a typing frame with a text flag",
      '{"type":"typing","conversationId":"c1","userId":"u","active":"yes"}',
    ],
  ])("drops %s", (_name, raw) => {
    expect(parseFrame(raw)).toBeNull();
  });

  it("drops a frame that is not text and not an object", () => {
    expect(parseFrame(42)).toBeNull();
    expect(parseFrame(undefined)).toBeNull();
  });
});

describe("typingPayload", () => {
  it("is exactly the conversation and the flag - the only frame a client sends", () => {
    expect(JSON.parse(typingPayload("c1", true))).toEqual({
      conversationId: "c1",
      active: true,
    });
  });
});
