/**
 * Build-time configuration. Expo inlines `process.env.EXPO_PUBLIC_*` only when
 * each variable is read by its full literal name, so they are listed one by
 * one rather than looked up through a helper.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy apps/mobile/.env.local.example to .env.local and fill it in.`,
    );
  }
  return value.replace(/\/+$/, "");
}

export const env = {
  supabaseUrl: required(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: required(
    "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  bffUrl: required("EXPO_PUBLIC_BFF_URL", process.env.EXPO_PUBLIC_BFF_URL),
  webUrl: required("EXPO_PUBLIC_WEB_URL", process.env.EXPO_PUBLIC_WEB_URL),
  /**
   * The backend's chat WebSocket origin (wss://...), the web's
   * NEXT_PUBLIC_CHAT_WS_URL. Optional: without it chat polls instead.
   */
  chatWsUrl:
    process.env.EXPO_PUBLIC_CHAT_WS_URL?.trim().replace(/\/+$/, "") || null,
} as const;
