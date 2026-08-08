/** Các kiểu dữ liệu khớp với response của Supabase GoTrue (/auth/v1/token). */

export interface SupabaseUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string;
  email_confirmed_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

/** Supabase vẫn trả 200 kèm khối này khi mật khẩu đúng nhưng yếu. */
export interface WeakPassword {
  message: string;
  reasons: string[];
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  /** Số giây còn hiệu lực. */
  expires_in: number;
  /** Unix timestamp (giây) lúc token hết hạn. */
  expires_at: number;
  refresh_token: string;
  user: SupabaseUser;
  weak_password?: WeakPassword;
}

/** Response khi đăng nhập thất bại, ví dụ: { code: 400, error_code: "invalid_credentials", msg: "..." } */
export interface AuthErrorResponse {
  code?: number;
  error_code?: string;
  msg?: string;
  /** Một số endpoint cũ dùng cặp error/error_description thay vì error_code/msg. */
  error?: string;
  error_description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
