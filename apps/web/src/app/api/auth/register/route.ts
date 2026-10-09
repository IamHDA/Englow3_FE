import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

const body = z.object({
  email: z.string().min(1).max(320),
  password: z.string().min(1).max(1024),
  fullName: z.string().max(200),
  displayName: z.string().max(200),
  birthDate: z.string().max(20),
  gender: z.string().max(40),
});

/** Creates the account; the confirmation link comes back through /auth/callback. */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;
  const { email, password, fullName, displayName, birthDate, gender } =
    read.value;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestOrigin(request)}/auth/callback`,
      data: {
        full_name: fullName,
        display_name: displayName,
        birth_date: birthDate,
        gender,
      },
    },
  });
  if (error) return authFailure(error);

  return authSuccess();
}
