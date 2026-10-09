import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";

export const dynamic = "force-dynamic";

const body = z.object({ password: z.string().min(1).max(1024) });

/**
 * Sets a new password for whoever holds the session - the reset link has
 * already signed them in through /auth/callback. Without a session Supabase
 * answers with the "session missing" error the page words for the learner.
 */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: read.value.password,
  });
  if (error) return authFailure(error);

  return authSuccess();
}
