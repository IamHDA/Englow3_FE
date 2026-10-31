import { describe, expect, it } from "vitest";

import { topicLabel } from "./dictationData";

describe("topicLabel", () => {
  it("names a known topic in the language on screen", () => {
    expect(topicLabel("Daily Conversation", true)).toBe("Giao tiếp hàng ngày");
    expect(topicLabel("Daily Conversation", false)).toBe("Daily Conversation");
    expect(topicLabel("Academic English", true)).toBe("Tiếng Anh học thuật");
  });

  it("shows a topic it does not know exactly as stored", () => {
    expect(topicLabel("shadowing", true)).toBe("shadowing");
  });
});
