import { z } from "zod";
import { authEmail } from "@/features/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const read = await readAuthRequest(request, z.object({ email: authEmail }));
  if (!read.ok) return read.response;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: read.value.email,
    options: { emailRedirectTo: `${requestOrigin(request)}/auth/callback` },
  });
  return error ? authFailure(error) : authSuccess();
}
