import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Only a same-origin path is safe to redirect to; anything else falls back to "/". */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
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
