"use client";

import { useContext } from "react";

import { AuthContext } from "../components/AuthProvider";

/**
 * Ai đang đăng nhập, dùng trong Client Component.
 *
 * Chỉ trả về danh tính từ Supabase. Tên hiển thị và avatar nằm ở
 * `useAccountProfile()` của feature `account` - hai nguồn khác nhau, hai kiểu
 * lỗi khác nhau, nên BFF sập không kéo theo trạng thái đăng nhập.
 */
export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth phải được gọi bên trong <AuthProvider>");
  }

  return value;
}
