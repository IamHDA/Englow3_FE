export const env = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8080",
  supabaseUrl:
    process.env.SUPABASE_URL ?? "https://jwqiedfdcjqbyyyemicb.supabase.co",
  supabaseApiKey:
    process.env.SUPABASE_API_KEY ??
    "sb_publishable_4yLc0Hg6y5Rn6_bYTLNfTw_RAST63Zc",
};

