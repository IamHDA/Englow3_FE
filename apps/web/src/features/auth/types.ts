import type { User } from "@supabase/supabase-js";

/**
 * Vai trò backend gán trong `app_metadata.role` của Supabase. Đọc được ở đây
 * chỉ để quyết định có vẽ lối vào khu quản trị hay không - giấu một nút không
 * phải là phân quyền, backend vẫn kiểm tra lại trên từng request.
 *
 * `app_metadata` chứ không phải `user_metadata`: cái thứ hai người dùng tự sửa
 * được.
 */
export const ADMIN_ROLE = "ADMIN";

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
  /** null khi claim thiếu hoặc sai kiểu - coi như người học thường. */
  role: string | null;
};

function readRole(user: User): string | null {
  const role = user.app_metadata?.role;
  return typeof role === "string" && role.trim() !== ""
    ? role.trim().toUpperCase()
    : null;
}

/** Dùng chung cho cả phía server lẫn client để hai bên không lệch nhau. */
export function toAuthSession(
  user: User | null | undefined,
): AuthSession | null {
  if (!user) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: readRole(user),
  };
}
