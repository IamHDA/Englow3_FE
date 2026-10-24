import { z } from "zod";
import { authEmail } from "@/features/auth/validation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

const body = z.object({ email: authEmail });

/** Sends the password-reset link; it returns through /auth/callback. */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;

  const supabase = await createSupabaseServerClient();
  // Keep the callback identical to the URL allowed in Supabase. Adding a
  // `next` query can fail its exact allowlist match and fall back to Site URL.
  // The PKCE recovery marker already sends this flow to /auth/reset.
  const { error } = await supabase.auth.resetPasswordForEmail(
    read.value.email,
    {
      redirectTo: `${requestOrigin(request)}/auth/callback`,
    },
  );
  if (error) return authFailure(error);

  return authSuccess();
}
