/**
 * Supabase's stable error codes as sentences a learner can act on. The wording
 * is the web app's (apps/web/src/features/auth/authErrorMessage.ts), so both
 * apps say the same thing for the same refusal.
 */
const ACCOUNT_EXISTS =
  "Email này đã có tài khoản. Hãy đăng nhập, hoặc dùng Quên mật khẩu.";

const MESSAGES: Record<string, string> = {
  provider_disabled:
    "Phương thức đăng nhập này chưa khả dụng. Hãy dùng email và mật khẩu.",
  validation_failed: "Thông tin chưa hợp lệ. Kiểm tra lại và thử lại.",
  reauthentication_needed: "Vui lòng đăng nhập lại trước khi đổi mật khẩu.",
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  user_already_exists: ACCOUNT_EXISTS,
  email_exists: ACCOUNT_EXISTS,
  email_not_confirmed:
    "Email chưa được xác nhận. Mở thư xác nhận Englow3 đã gửi rồi thử lại.",
  over_email_send_rate_limit:
    "Bạn vừa yêu cầu gửi thư. Đợi vài phút rồi thử lại nhé.",
  over_request_rate_limit: "Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại.",
  email_address_invalid: "Địa chỉ email không hợp lệ.",
  same_password: "Mật khẩu mới phải khác mật khẩu cũ.",
  weak_password: "Mật khẩu quá yếu. Hãy chọn mật khẩu khó đoán hơn.",
  session_not_found:
    "Link đặt lại mật khẩu đã hết hạn. Hãy yêu cầu một link mới.",
  otp_expired: "Link đã hết hạn. Hãy yêu cầu một link mới.",
};

const FALLBACK = "Có lỗi xảy ra. Kiểm tra kết nối rồi thử lại.";

export type AuthErrorLike =
  { code?: string; status?: number; name?: string } | null | undefined;

export function authErrorMessage(error: AuthErrorLike): string {
  if (!error) return FALLBACK;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]!;
  if (error.name === "AuthSessionMissingError") {
    return MESSAGES.session_not_found!;
  }
  if (error.status === 429) return MESSAGES.over_request_rate_limit!;
  return FALLBACK;
}
