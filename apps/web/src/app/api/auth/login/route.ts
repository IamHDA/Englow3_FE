import { z } from "zod";

import { toAuthSession } from "@/features/auth/types";
import { authEmail } from "@/features/auth/validation";
import {
  createSupabaseServerClient,
  rememberSessionPreference,
} from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";

export const dynamic = "force-dynamic";

const body = z.object({
  email: authEmail,
  password: z.string().min(1).max(1024),
  rememberMe: z.boolean(),
});

/**
 * Signs in with a password. The session is written to HttpOnly cookies by the
 * Supabase server client; the answer carries who signed in and nothing more.
 */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;
  const { email, password, rememberMe } = read.value;

  // A failed sign-in must not change an existing session's lifetime preference.
  const supabase = await createSupabaseServerClient({
    sessionOnly: !rememberMe,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return authFailure(error);
  if (!data.user)
    return authFailure({ code: "AUTH_INVALID_RESPONSE", status: 503 });
  await rememberSessionPreference(!rememberMe);

  return authSuccess({ session: toAuthSession(data.user) });
}
