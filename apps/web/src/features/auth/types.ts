import type { User } from "@supabase/supabase-js";

/**
 * Ai đang đăng nhập - chỉ vậy thôi.
 *
 * Cố ý KHÔNG phải `Session` đầy đủ của Supabase: access token là việc riêng của
 * SDK, không có gì bên ngoài feature này được cầm tới nó. Tên hiển thị và avatar
 * thuộc về feature `account` (lấy từ BFF), không phải ở đây.
 */
export type AuthSession = {
  userId: string;
  email: string | null;
};

/** Dùng chung cho cả phía server lẫn client để hai bên không lệch nhau. */
export function toAuthSession(
  user: User | null | undefined,
): AuthSession | null {
  if (!user) return null;

  return { userId: user.id, email: user.email ?? null };
}
