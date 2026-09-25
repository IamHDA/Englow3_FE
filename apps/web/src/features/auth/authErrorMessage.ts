/**
 * Supabase Auth's own messages are English sentences written for developers
 * ("Invalid login credentials", "Auth session missing!"). These are what a
 * learner sees instead, keyed on the stable `code` Supabase sends alongside.
 */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  user_already_exists:
    "Email này đã có tài khoản. Hãy đăng nhập, hoặc dùng Quên mật khẩu.",
  email_exists:
    "Email này đã có tài khoản. Hãy đăng nhập, hoặc dùng Quên mật khẩu.",
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

export function authErrorMessage(
  error: { code?: string; status?: number; name?: string } | null | undefined,
): string {
  if (!error) return FALLBACK;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  // Thrown client-side, before any request, when there is no session at all -
  // the reset page opened without the link, or after it expired.
  if (error.name === "AuthSessionMissingError") {
    return MESSAGES.session_not_found;
  }
  if (error.status === 429) return MESSAGES.over_request_rate_limit;
  return FALLBACK;
}
