import { describe, expect, it } from "vitest";

import { authErrorMessage } from "./authErrorMessage";

describe("authErrorMessage", () => {
  it("answers in Vietnamese by default", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
  });

  it("answers in English when asked", () => {
    expect(authErrorMessage({ code: "invalid_credentials" }, false)).toBe(
      "Wrong email or password.",
    );
  });

  it("maps a missing session and a 429 the same way in both languages", () => {
    expect(authErrorMessage({ name: "AuthSessionMissingError" }, false)).toBe(
      "The reset link has expired. Ask for a new one.",
    );
    expect(authErrorMessage({ status: 429 }, false)).toBe(
      "Too many attempts. Wait a moment, then try again.",
    );
  });

  it("falls back to a generic sentence for anything unknown", () => {
    expect(authErrorMessage(null, false)).toBe(
      "Something went wrong. Check the connection and try again.",
    );
    expect(authErrorMessage({ code: "something_new" })).toBe(
      "Có lỗi xảy ra. Kiểm tra kết nối rồi thử lại.",
    );
  });
});
