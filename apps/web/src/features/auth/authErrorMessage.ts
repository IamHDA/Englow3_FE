/**
 * Supabase Auth's own messages are English sentences written for developers
 * ("Invalid login credentials", "Auth session missing!"). These are what a
 * learner sees instead, keyed on the stable `code` Supabase sends alongside.
 */
type Words = { vi: string; en: string };

const ACCOUNT_EXISTS: Words = {
  vi: "Email này đã có tài khoản. Hãy đăng nhập, hoặc dùng Quên mật khẩu.",
  en: "This email already has an account. Sign in, or use Forgot password.",
};

const MESSAGES: Record<string, Words> = {
  invalid_credentials: {
    vi: "Email hoặc mật khẩu không đúng.",
    en: "Wrong email or password.",
  },
  user_already_exists: ACCOUNT_EXISTS,
  email_exists: ACCOUNT_EXISTS,
  email_not_confirmed: {
    vi: "Email chưa được xác nhận. Mở thư xác nhận Englow3 đã gửi rồi thử lại.",
    en: "Your email is not confirmed yet. Open the confirmation email from Englow3, then try again.",
  },
  over_email_send_rate_limit: {
    vi: "Bạn vừa yêu cầu gửi thư. Đợi vài phút rồi thử lại nhé.",
    en: "An email was just sent. Wait a few minutes, then try again.",
  },
  over_request_rate_limit: {
    vi: "Bạn thao tác hơi nhanh. Đợi một lát rồi thử lại.",
    en: "Too many attempts. Wait a moment, then try again.",
  },
  email_address_invalid: {
    vi: "Địa chỉ email không hợp lệ.",
    en: "That email address is not valid.",
  },
  same_password: {
    vi: "Mật khẩu mới phải khác mật khẩu cũ.",
    en: "The new password must differ from the old one.",
  },
  weak_password: {
    vi: "Mật khẩu quá yếu. Hãy chọn mật khẩu khó đoán hơn.",
    en: "That password is too weak. Pick one that is harder to guess.",
  },
  session_not_found: {
    vi: "Link đặt lại mật khẩu đã hết hạn. Hãy yêu cầu một link mới.",
    en: "The reset link has expired. Ask for a new one.",
  },
  otp_expired: {
    vi: "Link đã hết hạn. Hãy yêu cầu một link mới.",
    en: "The link has expired. Ask for a new one.",
  },
};

const FALLBACK: Words = {
  vi: "Có lỗi xảy ra. Kiểm tra kết nối rồi thử lại.",
  en: "Something went wrong. Check the connection and try again.",
};

function pickWords(
  error: { code?: string; status?: number; name?: string } | null | undefined,
): Words {
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

export function authErrorMessage(
  error: { code?: string; status?: number; name?: string } | null | undefined,
  isVi = true,
): string {
  const words = pickWords(error);
  return isVi ? words.vi : words.en;
}
