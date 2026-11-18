import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TYPING_EXPIRE_MS, TYPING_SEND_INTERVAL_MS } from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";

import { useTypingSignal } from "./useTypingSignal";

const PARTNER = "partner";

function setup(partnerId: string | null = PARTNER) {
  const listeners = new Set<(frame: ChatFrame) => void>();
  const sendTyping = vi.fn(() => true);
  // One function for the whole life of the hook, as the chat provider's is: a
  // new one on every render would resubscribe, and resubscribing drops the timer.
  const subscribe = (listener: (frame: ChatFrame) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const hook = renderHook(() =>
    useTypingSignal({ conversationId: "c1", partnerId, sendTyping, subscribe }),
  );
  const emit = (frame: ChatFrame) =>
    act(() => listeners.forEach((listener) => listener(frame)));
  return { ...hook, sendTyping, emit };
}

const typing = (
  active: boolean,
  userId = PARTNER,
  conversationId = "c1",
): ChatFrame => ({
  type: FRAME_TYPE.typing,
  conversationId,
  userId,
  active,
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("sending", () => {
  it("says the viewer is typing on the first keystroke, and at most every 3 seconds after", () => {
    const { result, sendTyping } = setup();

    act(() => result.current.onInput(true));
    expect(sendTyping).toHaveBeenCalledExactlyOnceWith("c1", true);

    // Keystrokes inside the window send nothing.
    for (
      let elapsed = 0;
      elapsed < TYPING_SEND_INTERVAL_MS - 1_000;
      elapsed += 500
    ) {
      act(() => vi.advanceTimersByTime(500));
      act(() => result.current.onInput(true));
    }
    expect(sendTyping).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(TYPING_SEND_INTERVAL_MS));
    act(() => result.current.onInput(true));
    expect(sendTyping).toHaveBeenCalledTimes(2);
    expect(sendTyping).toHaveBeenLastCalledWith("c1", true);
  });

  it("says the viewer stopped when the box is emptied, once", () => {
    const { result, sendTyping } = setup();
    act(() => result.current.onInput(true));

    act(() => result.current.onInput(false));
    act(() => result.current.onInput(false));

    expect(sendTyping.mock.calls).toEqual([
      ["c1", true],
      ["c1", false],
    ]);
  });

  it("says nothing about stopping when it never said they started", () => {
    const { result, sendTyping } = setup();

    act(() => result.current.onInput(false));
    act(() => result.current.stop());

    expect(sendTyping).not.toHaveBeenCalled();
  });

  it("stops on request - leaving the box or sending - and starts straight away on the next keystroke", () => {
    const { result, sendTyping } = setup();
    act(() => result.current.onInput(true));
    act(() => result.current.stop());

    act(() => result.current.onInput(true));

    expect(sendTyping.mock.calls).toEqual([
      ["c1", true],
      ["c1", false],
      ["c1", true],
    ]);
  });

  it("stops when the conversation is left with the viewer still typing", () => {
    const { result, sendTyping, unmount } = setup();
    act(() => result.current.onInput(true));

    unmount();

    expect(sendTyping).toHaveBeenLastCalledWith("c1", false);
  });
});

describe("showing the partner's", () => {
  it("shows typing, and forgets it after 5 seconds without another signal", () => {
    const { result, emit } = setup();

    emit(typing(true));
    expect(result.current.partnerTyping).toBe(true);

    act(() => vi.advanceTimersByTime(TYPING_EXPIRE_MS - 1));
    expect(result.current.partnerTyping).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.partnerTyping).toBe(false);
  });

  it("starts the 5 seconds again with every signal", () => {
    const { result, emit } = setup();
    emit(typing(true));
    act(() => vi.advanceTimersByTime(TYPING_EXPIRE_MS - 1_000));

    emit(typing(true));
    act(() => vi.advanceTimersByTime(TYPING_EXPIRE_MS - 1));

    expect(result.current.partnerTyping).toBe(true);
  });

  it("switches off at once for a signal that says they stopped", () => {
    const { result, emit } = setup();
    emit(typing(true));

    emit(typing(false));

    expect(result.current.partnerTyping).toBe(false);
  });

  it("switches off at once when a message from the partner arrives", () => {
    const { result, emit } = setup();
    emit(typing(true));

    emit({
      type: FRAME_TYPE.message,
      message: {
        id: "m1",
        conversationId: "c1",
        seq: 1,
        senderId: PARTNER,
        body: "hi",
        imageUrl: null,
        recalled: false,
        sentAt: "2026-11-16T03:00:00Z",
        clientId: null,
      },
    });

    expect(result.current.partnerTyping).toBe(false);
  });

  it("is not switched off by the viewer's own message", () => {
    const { result, emit } = setup();
    emit(typing(true));

    emit({
      type: FRAME_TYPE.message,
      message: {
        id: "m1",
        conversationId: "c1",
        seq: 1,
        senderId: "me",
        body: "hi",
        imageUrl: null,
        recalled: false,
        sentAt: "2026-11-16T03:00:00Z",
        clientId: "k1",
      },
    });

    expect(result.current.partnerTyping).toBe(true);
  });

  it("ignores another conversation, and anyone but the partner", () => {
    const { result, emit } = setup();

    emit(typing(true, PARTNER, "c2"));
    emit(typing(true, "stranger"));

    expect(result.current.partnerTyping).toBe(false);
  });

  it("shows nothing for a conversation whose other person is gone", () => {
    const { result, emit } = setup(null);

    emit(typing(true, "anyone"));

    expect(result.current.partnerTyping).toBe(false);
  });

  it("leaves no timer behind when unmounted", () => {
    const { emit, unmount } = setup();
    emit(typing(true));

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
