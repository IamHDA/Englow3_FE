import { NextResponse } from "next/server";
import { z } from "zod";

import { safeNext } from "@/features/auth/safeNext";
import { homeForRole, toAuthSession } from "@/features/auth/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = z
    .enum([
      "email",
      "signup",
      "recovery",
      "invite",
      "magiclink",
      "email_change",
    ])
    .safeParse(searchParams.get("type"));
  const requested = searchParams.get("next");
  const next =
    type.success && type.data === "recovery"
      ? "/auth/reset"
      : safeNext(requested);
  const redirect = (path: string) => {
    const response = NextResponse.redirect(`${origin}${path}`);
    response.headers.set("cache-control", "no-store");
    response.headers.set("referrer-policy", "no-referrer");
    return response;
  };

  if (!searchParams.has("error") && (code || (tokenHash && type.success))) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = code
        ? await supabase.auth.exchangeCodeForSession(
            code,
            searchParams.has("sb_flow_id")
              ? { flowId: searchParams.get("sb_flow_id")! }
              : undefined,
          )
        : await supabase.auth.verifyOtp({
            token_hash: tokenHash!,
            type: type.success ? type.data : "email",
          });
      if (!error && data.user) {
        if ("redirectType" in data && data.redirectType === "recovery") {
          return redirect("/auth/reset");
        }
        // A link that names its page (the password reset) goes there. One that
        // does not - a Google sign-in, a confirmation email - lands where the
        // role's work is, as signing in with a password does.
        const home =
          requested || next === "/auth/reset"
            ? null
            : homeForRole(toAuthSession(data.user)?.role);
        return redirect(home ?? next);
      }
    } catch {
      // An interrupted exchange must offer recovery rather than render a server error.
    }
  }

  // A reset link that failed has almost always expired or been used already.
  // Send the learner where they can ask for a new one, not to the home page
  // with nothing said.
  if (next === "/auth/reset") {
    return redirect("/auth/forgot?expired=1");
  }

  return redirect("/auth/error");
}
