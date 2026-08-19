"use client";

import { useRouter } from "next/navigation";
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
  const [session, setSession] = useState(initialSession);

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
    await supabase.auth.signOut();
    // Cần cả hai: signOut cập nhật context phía client, còn refresh bắt root
    // layout tính lại initialSession/initialProfile - thiếu nó thì lần điều
    // hướng server tiếp theo dựng lại đúng trạng thái cũ.
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
