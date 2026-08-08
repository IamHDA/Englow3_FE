import { env } from '@/lib/env';
import type {
  AuthErrorResponse,
  AuthSession,
  LoginCredentials,
} from './types';

/** Lỗi đăng nhập đã được chuẩn hoá để tầng UI hiển thị thẳng `message`. */
export class AuthError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

/** Chuyển error_code của Supabase thành câu tiếng Việt cho người dùng cuối. */
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Tài khoản hoặc mật khẩu không đúng.',
  email_not_confirmed: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
  user_banned: 'Tài khoản đã bị khoá. Vui lòng liên hệ hỗ trợ.',
  over_request_rate_limit: 'Bạn thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.',
  validation_failed: 'Thông tin đăng nhập chưa hợp lệ.',
};

function toAuthError(payload: AuthErrorResponse, status: number): AuthError {
  const code = payload.error_code ?? payload.error ?? 'unknown_error';
  const message =
    ERROR_MESSAGES[code] ??
    payload.msg ??
    payload.error_description ??
    'Đăng nhập thất bại. Vui lòng thử lại.';

  return new AuthError(message, payload.code ?? status, code);
}

/**
 * Đăng nhập bằng email + mật khẩu qua Supabase Auth.
 *
 * Gọi thẳng REST endpoint thay vì @supabase/supabase-js để không kéo thêm
 * dependency cho một request duy nhất.
 *
 * @throws {AuthError} khi sai thông tin đăng nhập hoặc không gọi được API.
 */
export async function loginWithPassword(
  credentials: LoginCredentials,
  signal?: AbortSignal,
): Promise<AuthSession> {
  const url = `${env.supabaseUrl}/auth/v1/token?grant_type=password`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: env.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new AuthError(
      'Không kết nối được máy chủ. Kiểm tra lại đường truyền rồi thử lại.',
      0,
      'network_error',
    );
  }

  // Supabase luôn trả JSON; nếu parse hỏng thì coi như lỗi máy chủ.
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AuthError('Máy chủ trả về dữ liệu không hợp lệ.', response.status, 'invalid_response');
  }

  if (!response.ok) {
    throw toAuthError(payload as AuthErrorResponse, response.status);
  }

  return payload as AuthSession;
}
