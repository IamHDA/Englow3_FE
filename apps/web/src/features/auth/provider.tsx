"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import { readStoredLanguage } from "@/shared/context/LanguageContext";
import { authErrorMessage } from "./authErrorMessage";

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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signingOut = useRef(false);

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
    const isVi = readStoredLanguage() === "vi";
    if (signingOut.current) return;
    signingOut.current = true;
    setIsSigningOut(true);
    const id = notifications.show({
      loading: true,
      autoClose: false,
      withCloseButton: false,
      message: isVi ? "Đang đăng xuất…" : "Signing out…",
    });
    try {
      // Local storage cleanup must not prevent the server from ending the session.
      await clearBrowserDrafts().catch(() => undefined);
      const response = await signOutOfServer();
      if (response.error) {
        notifications.update({
          id,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
          color: "red",
          message: authErrorMessage(response.error, isVi),
        });
        return;
      }
      notifications.update({
        id,
        loading: false,
        autoClose: 2500,
        withCloseButton: true,
        color: "teal",
        message: isVi ? "Đã đăng xuất" : "Signed out",
      });
    } catch {
      notifications.update({
        id,
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
        color: "red",
        message: authErrorMessage(null, isVi),
      });
    } finally {
      signingOut.current = false;
      setIsSigningOut(false);
      announceSessionChange();
      // Bắt root layout tính lại initialSession/initialProfile - thiếu nó thì
      // lần điều hướng server tiếp theo dựng lại đúng trạng thái cũ.
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, signOut, isSigningOut }}>
      {children}
    </AuthContext.Provider>
  );
}
