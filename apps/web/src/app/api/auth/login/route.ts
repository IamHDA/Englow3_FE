import { z } from "zod";

import { toAuthSession } from "@/features/auth/types";
import {
  createSupabaseServerClient,
  rememberSessionPreference,
} from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";

export const dynamic = "force-dynamic";

const body = z.object({
  email: z.string().min(1).max(320),
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

  // Written before signing in, so the cookies it creates already know whether
  // they are meant to end with the browser.
  await rememberSessionPreference(!rememberMe);
  const supabase = await createSupabaseServerClient({
    sessionOnly: !rememberMe,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return authFailure(error);

  return authSuccess({ session: toAuthSession(data.user) });
}
