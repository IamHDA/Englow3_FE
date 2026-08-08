import { env } from "../config/env.js";

export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  user?: any;
  error?: string;
  error_description?: string;
  msg?: string;
}

export async function loginWithSupabase(
  email: string,
  password?: string
): Promise<LoginResponse> {
  const url = `${env.supabaseUrl}/auth/v1/token?grant_type=password`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseApiKey,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      error: data.error || data.msg || "Authentication failed",
      error_description:
        data.error_description || data.msg || "Invalid login credentials",
    };
  }

  return data;
}
