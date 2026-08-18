import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { toAuthSession, type AuthSession } from "../types";

/**
 * Ai đang đăng nhập, đọc từ phía server.
 *
 * Đây là cửa dành cho Server Component và Route Handler - `useAuth()` là hook
 * nên không dùng được ở đó. Một trang cần chặn truy cập sẽ viết:
 *
 *     const session = await getServerSession();
 *     if (!session) redirect("/");
 *
 * Dùng `getSession()` (đọc cookie, không gọi mạng) chứ không phải `getUser()`:
 * middleware.ts đã gọi `getUser()` trên gần như mọi request nên cookie tới đây
 * đã được xác thực rồi, gọi lại là thừa một vòng mạng mỗi lần render.
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return toAuthSession(session?.user);
}
