import { NextResponse } from "next/server";

import { homeForRole, toAuthSession } from "@/features/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Only a same-origin path is safe to redirect to; anything else falls back to "/". */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const next = safeNext(requested);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // A link that names its page (the password reset) goes there. One that
      // does not - a Google sign-in, a confirmation email - lands where the
      // role's work is, as signing in with a password does.
      const home = requested
        ? null
        : homeForRole(toAuthSession(data.user)?.role);
      return NextResponse.redirect(`${origin}${home ?? next}`);
    }
  }

  // A reset link that failed has almost always expired or been used already.
  // Send the learner where they can ask for a new one, not to the home page
  // with nothing said.
  if (next === "/auth/reset") {
    return NextResponse.redirect(`${origin}/auth/forgot?expired=1`);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
