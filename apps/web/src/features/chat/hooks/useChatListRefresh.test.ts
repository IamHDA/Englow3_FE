import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { REFRESH_DEBOUNCE_MS } from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";

import { useChatListRefresh } from "./useChatListRefresh";

function setup() {
  const listeners = new Set<(frame: ChatFrame) => void>();
  const subscribe = (listener: (frame: ChatFrame) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const refresh = vi.fn();
  const hook = renderHook(
    ({ connectionCount }) =>
      useChatListRefresh({ subscribe, connectionCount, refresh }),
    { initialProps: { connectionCount: 0 } },
  );
  const emit = (frame: ChatFrame) =>
    act(() => listeners.forEach((listener) => listener(frame)));
  return { ...hook, refresh, emit };
}

const read: ChatFrame = {
  type: FRAME_TYPE.read,
  conversationId: "c1",
  userId: "u2",
  upToSeq: 3,
};
const typing: ChatFrame = {
  type: FRAME_TYPE.typing,
  conversationId: "c1",
  userId: "u2",
  active: true,
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useChatListRefresh", () => {
  it("fetches the lists again once, a second after the last frame of a burst", () => {
    const { refresh, emit } = setup();

    emit(read);
    act(() => vi.advanceTimersByTime(REFRESH_DEBOUNCE_MS - 200));
    emit({ ...read, upToSeq: 4 });
    act(() => vi.advanceTimersByTime(REFRESH_DEBOUNCE_MS - 1));
    expect(refresh).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("refreshes for a new message, a recall and a read mark, but not for typing", () => {
    const { refresh, emit } = setup();

    emit(typing);
    act(() => vi.advanceTimersByTime(10 * REFRESH_DEBOUNCE_MS));
    expect(refresh).not.toHaveBeenCalled();

    emit({
      type: FRAME_TYPE.recalled,
      conversationId: "c1",
      messageId: "m1",
      seq: 1,
    });
    act(() => vi.advanceTimersByTime(REFRESH_DEBOUNCE_MS));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("fetches at once when the socket opens, the first time and every time after", () => {
    const { refresh, rerender } = setup();
    expect(refresh).not.toHaveBeenCalled();

    rerender({ connectionCount: 1 });
    expect(refresh).toHaveBeenCalledTimes(1);
    rerender({ connectionCount: 2 });
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("leaves no timer behind, and stops listening, when unmounted", () => {
    const { emit, unmount, refresh } = setup();
    emit(read);

    unmount();
    act(() => vi.advanceTimersByTime(10 * REFRESH_DEBOUNCE_MS));

    expect(refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
