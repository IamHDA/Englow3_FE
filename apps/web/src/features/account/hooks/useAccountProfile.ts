"use client";

import { useContext } from "react";

import { AccountContext } from "../components/AccountProvider";

/**
 * Hồ sơ người dùng (tên, avatar, bước onboarding) trong Client Component.
 *
 * `profile: null` có hai nghĩa, phân biệt bằng `hasError`: chưa đăng nhập
 * (hasError false) hay đang đăng nhập nhưng BFF không trả về được (true).
 */
export function useAccountProfile() {
  const value = useContext(AccountContext);

  if (!value) {
    throw new Error("useAccountProfile phải được gọi bên trong <AccountProvider>");
  }

  return value;
}
