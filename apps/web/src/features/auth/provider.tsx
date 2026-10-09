"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

import { clearBrowserDrafts } from "@/shared/storage/browserDrafts";

import { signOutOfServer } from "@/features/auth/api/authClient";
import {
  announceSessionChange,
  onSessionChangeElsewhere,
} from "@/features/auth/api/sessionSync";
import type { AuthSession } from "@/features/auth/types";

import { AuthContext } from "./context";
export { AuthContext } from "./context";

type AuthProviderProps = {
  /**
   * Tính sẵn từ server (root layout) nên HTML đầu tiên đã đúng trạng thái -
   * không nháy giữa "chưa biết" và "đã biết ai đăng nhập". Cũng vì vậy mà
   * context không có cờ `loading`: câu trả lời có ngay từ lần render đầu.
   *
   * Phiên nằm trong cookie HttpOnly mà trang không đọc được, nên đây là nguồn
   * duy nhất: sau mỗi lần đăng nhập/đăng xuất `router.refresh()` bắt root
   * layout tính lại và prop này đổi theo.
   */
  initialSession: AuthSession | null;
  children: ReactNode;
};

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const router = useRouter();
  const session = initialSession;

  /**
   * Id đang được phản ánh trên màn hình. Prop đổi cả khi chỉ làm tươi trang
   * (cùng người dùng) nên phải so id trước khi dọn bản nháp của người cũ.
   */
  const currentUserId = useRef(initialSession?.userId ?? null);

  useEffect(() => {
    const nextUserId = initialSession?.userId ?? null;
    if (nextUserId === currentUserId.current) return;
    // Đăng xuất, hoặc đổi sang người khác: bản nháp trong trình duyệt thuộc về
    // người trước, không được để người sau thấy.
    if (currentUserId.current) void clearBrowserDrafts();
    currentUserId.current = nextUserId;
  }, [initialSession]);

  // Tab khác đăng nhập/đăng xuất: hỏi lại server thay vì giữ tài khoản cũ.
  useEffect(() => onSessionChangeElsewhere(() => router.refresh()), [router]);

  const signOut = useCallback(async () => {
    await clearBrowserDrafts();
    try {
      await signOutOfServer();
    } finally {
      announceSessionChange();
      // Bắt root layout tính lại initialSession/initialProfile - thiếu nó thì
      // lần điều hướng server tiếp theo dựng lại đúng trạng thái cũ.
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
