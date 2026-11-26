import { CombinedGraphQLErrors } from "@apollo/client";

/**
 * Reading errors the BFF returns. Mirrors apps/web/src/shared/network/loadError.ts:
 * the BFF puts its own code in `extensions.code` and forwards the backend's in
 * `extensions.backendCode`.
 */
function extensionsOf(error: unknown) {
  return CombinedGraphQLErrors.is(error)
    ? error.errors.map((item) => item.extensions ?? {})
    : [];
}

export type LoadErrorKind = "not-found" | "unavailable";

const NOT_FOUND_CODES = new Set(["NOT_FOUND", "BAD_USER_INPUT"]);

export function loadErrorKind(error: unknown): LoadErrorKind {
  return extensionsOf(error).some(
    (extensions) =>
      typeof extensions.code === "string" &&
      NOT_FOUND_CODES.has(extensions.code),
  )
    ? "not-found"
    : "unavailable";
}

export function backendCodeOf(error: unknown): string | null {
  const code = extensionsOf(error)[0]?.backendCode;
  return typeof code === "string" ? code : null;
}

export function errorCodeOf(error: unknown): string | null {
  const code = extensionsOf(error)[0]?.code;
  return typeof code === "string" ? code : null;
}

/**
 * A sentence a learner can act on. Screens pass their own messages for the
 * backend codes they know; anything else gets a generic line by kind.
 */
export function errorMessage(
  error: unknown,
  known: Record<string, string> = {},
): string {
  const backend = backendCodeOf(error);
  if (backend && known[backend]) return known[backend];
  const code = errorCodeOf(error);
  if (code && known[code]) return known[code];
  switch (code) {
    case "FORBIDDEN":
      return "Bạn không có quyền thực hiện thao tác này.";
    case "UNAUTHENTICATED":
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    case "NOT_FOUND":
      return "Không tìm thấy nội dung bạn cần.";
    case "BAD_USER_INPUT":
      return "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.";
    case "CONFLICT":
      return "Dữ liệu vừa thay đổi ở nơi khác. Vui lòng tải lại rồi thử lại.";
    case "TOO_MANY_REQUESTS":
      return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
    case "BACKEND_UNAVAILABLE":
      return "Máy chủ đang khởi động hoặc bận. Vui lòng thử lại sau giây lát.";
    default:
      return "Không kết nối được máy chủ. Vui lòng thử lại.";
  }
}
