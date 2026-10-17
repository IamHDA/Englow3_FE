"use client";

import { useRouter } from "next/navigation";
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase/client";

import { toAuthSession, type AuthSession } from "@/features/auth/types";

type AuthContextValue = {
  session: AuthSession | null;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  /**
   * Tính sẵn từ server (root layout) nên HTML đầu tiên đã đúng trạng thái -
   * không nháy giữa "chưa biết" và "đã biết ai đăng nhập". Cũng vì vậy mà
   * context không có cờ `loading`: câu trả lời có ngay từ lần render đầu.
   */
  initialSession: AuthSession | null;
  children: ReactNode;
};

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const router = useRouter();
<<<<<<< Updated upstream
  const [session, setSession] = useState(initialSession);
=======
  const session = initialSession;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const signingOut = useRef(false);
>>>>>>> Stashed changes

  /**
   * Id đang được phản ánh trên màn hình. Supabase bắn `INITIAL_SESSION` ngay
   * khi subscribe (mọi lần mount) và `TOKEN_REFRESHED` định kỳ - cả hai đều
   * mang đúng người dùng cũ. So id trước khi setState để hai sự kiện đó không
   * kéo theo một vòng fetch BFF thừa ở AccountProvider.
   */
  const currentUserId = useRef(initialSession?.userId ?? null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      const nextSession = toAuthSession(supabaseSession?.user);
      if (nextSession?.userId === currentUserId.current) return;

      currentUserId.current = nextSession?.userId ?? null;
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
<<<<<<< Updated upstream
    await supabase.auth.signOut();
    // Cần cả hai: signOut cập nhật context phía client, còn refresh bắt root
    // layout tính lại initialSession/initialProfile - thiếu nó thì lần điều
    // hướng server tiếp theo dựng lại đúng trạng thái cũ.
    router.refresh();
=======
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
>>>>>>> Stashed changes
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, signOut, isSigningOut }}>
      {children}
    </AuthContext.Provider>
  );
}
