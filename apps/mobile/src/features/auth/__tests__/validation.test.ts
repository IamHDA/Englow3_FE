import { authErrorMessage } from "../authErrorMessage";
import { fieldErrors, registrationRequest } from "../validation";

const valid = {
  email: "learner@example.com",
  password: "Secret#123",
  fullName: "Nguyen Van A",
  displayName: "van_a",
  birthDate: "2000-01-31",
  gender: "MALE",
  acceptedTerms: true,
};

describe("registrationRequest", () => {
  it("accepts what the web's server route accepts", () => {
    expect(registrationRequest.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["password", { password: "secret123" }, "chữ hoa"],
    ["displayName", { displayName: "Văn A" }, "3-20 ký tự"],
    ["birthDate", { birthDate: "2999-01-01" }, "tương lai"],
    ["acceptedTerms", { acceptedTerms: false }, "điều khoản"],
  ])("explains a bad %s in Vietnamese", (field, change, words) => {
    const parsed = registrationRequest.safeParse({ ...valid, ...change });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(fieldErrors(parsed.error)[field]).toContain(words);
  });
});

describe("authErrorMessage", () => {
  it("maps Supabase's stable codes", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email hoặc mật khẩu không đúng.",
    );
  });

  it("falls back for anything unknown, including no error object", () => {
    expect(authErrorMessage({ code: "something_new" })).toContain("thử lại");
    expect(authErrorMessage(null)).toContain("thử lại");
  });

  it("treats HTTP 429 as rate limiting", () => {
    expect(authErrorMessage({ status: 429 })).toContain("nhanh");
  });
});
