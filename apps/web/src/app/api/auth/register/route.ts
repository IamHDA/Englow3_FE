import { toAuthSession } from "@/features/auth/types";
import { registrationRequest } from "@/features/auth/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

/** Creates the account; the confirmation link comes back through /auth/callback. */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, registrationRequest);
  if (!read.ok) return read.response;
  const { email, password, fullName, displayName, birthDate, gender } =
    read.value;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
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

  return authSuccess({
    session: data.session ? toAuthSession(data.user) : null,
  });
}
