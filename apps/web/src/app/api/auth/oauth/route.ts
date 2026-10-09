import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";
import { requestOrigin } from "@/server/csrf";

export const dynamic = "force-dynamic";

const body = z.object({ provider: z.enum(["google", "facebook"]) });

/**
 * Starts a social sign-in. The PKCE verifier Supabase generates is kept in an
 * HttpOnly cookie, and the page is only handed the provider's address to go to;
 * /auth/callback finishes the exchange on the server.
 */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, body);
  if (!read.ok) return read.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: read.value.provider,
    options: {
      redirectTo: `${requestOrigin(request)}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) return authFailure(error);

  return authSuccess({ url: data.url });
}
