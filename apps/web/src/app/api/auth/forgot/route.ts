import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

const body = z.object({ email: z.string().min(1).max(320) });

/** Sends the password-reset link; it returns through /auth/callback. */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    read.value.email,
    { redirectTo: `${requestOrigin(request)}/auth/callback?next=/auth/reset` },
  );
  if (error) return authFailure(error);

  return authSuccess();
}
