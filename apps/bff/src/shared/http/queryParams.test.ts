import { describe, expect, it } from "vitest";

import { toQueryString } from "./queryParams.js";

describe("toQueryString", () => {
  it("drops unset filters but keeps page 0", () => {
    expect(
      toQueryString({
        status: null,
        title: "",
        topic: undefined,
        page: 0,
        size: 20,
      }),
    ).toBe("page=0&size=20");
  });

  it("encodes values", () => {
    expect(toQueryString({ title: "a&b c" })).toBe("title=a%26b+c");
  });
});
