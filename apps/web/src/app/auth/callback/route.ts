import { NextResponse, type NextRequest } from "next/server";

import { safeRedirectPath } from "@/features/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the OAuth providers and the email-confirmation link land after
 * Supabase hands the browser back. The PKCE `code` is exchanged for a session
 * here, on the server, so the session cookies are set before anything renders.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // The provider reports refusals and cancellations on the query string.
  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  return NextResponse.redirect(
    `${origin}${safeRedirectPath(searchParams.get("next"))}`,
  );
}
