import { NextResponse } from "next/server";

const BFF_URL = process.env.BFF_URL || "http://localhost:4000/api/auth/login";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Try authenticating via BFF Express server first
    try {
      const bffRes = await fetch(BFF_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (bffRes.ok) {
        const data = await bffRes.json();
        return NextResponse.json(data);
      }
      // If BFF returns an error response (e.g. 400 invalid credentials), pass it back
      const bffError = await bffRes.json().catch(() => null);
      if (bffError && (bffError.error || bffError.error_description)) {
        return NextResponse.json(bffError, { status: bffRes.status });
      }
    } catch {
      // If BFF is not reachable, fall back to direct Supabase Auth API call
    }

    // Direct Supabase call (BFF fallback)
    const supabaseRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const supabaseData = await supabaseRes.json();

    if (!supabaseRes.ok) {
      return NextResponse.json(
        {
          error: supabaseData.error || supabaseData.msg || "Authentication failed",
          error_description:
            supabaseData.error_description ||
            supabaseData.msg ||
            "Invalid email or password",
        },
        { status: supabaseRes.status }
      );
    }

    return NextResponse.json(supabaseData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
