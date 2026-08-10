import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { displayName } from "./displayName";

function user(partial: Partial<User>): User {
  return { user_metadata: {}, ...partial } as User;
}

describe("displayName", () => {
  it("prefers the name set at sign-up", () => {
    expect(
      displayName(
        user({
          email: "bienvaduyanh@gmail.com",
          user_metadata: { full_name: "Bien" },
        }),
      ),
    ).toBe("Bien");
  });

  it("falls back through the other metadata keys", () => {
    expect(displayName(user({ user_metadata: { name: "Hoa" } }))).toBe("Hoa");
    expect(displayName(user({ user_metadata: { user_name: "Minh" } }))).toBe("Minh");
  });

  it("ignores blank or non-string metadata", () => {
    expect(
      displayName(
        user({ email: "hoa@englow3.com", user_metadata: { full_name: "   " } }),
      ),
    ).toBe("Hoa");
    expect(
      displayName(user({ email: "hoa@englow3.com", user_metadata: { name: 42 } })),
    ).toBe("Hoa");
  });

  it("capitalises the local part of the email when there is no name", () => {
    expect(displayName(user({ email: "bienvaduyanh@gmail.com" }))).toBe(
      "Bienvaduyanh",
    );
  });

  it("greets generically when there is neither a name nor an email", () => {
    expect(displayName(user({}))).toBe("there");
  });
});
