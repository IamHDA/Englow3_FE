import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { toAuthSession, type AuthSession } from "@/features/auth/types";

/**
 * Ai đang đăng nhập, đọc từ phía server.
 *
 * Đây là cửa dành cho Server Component và Route Handler - `useAuth()` là hook
 * nên không dùng được ở đó. Một trang cần chặn truy cập sẽ viết:
 *
 *     const session = await getServerSession();
 *     if (!session) redirect("/");
 *
 * Verify signed claims before using an identity in HTML. A public page can
 * proceed through proxy.ts even when a stale or tampered cookie was rejected.
 * getSession().user alone is not a verified identity. JWKS are cached by the SDK.
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims || typeof claims.sub !== "string") return null;
  return toAuthSession({
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    app_metadata: claims.app_metadata ?? {},
  });
}
