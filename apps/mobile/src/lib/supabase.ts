import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { env } from "./env";
import { LargeSecureStore } from "./largeSecureStore";

/**
 * The app's one Supabase client. Unlike the web app, where the server keeps
 * the session in HttpOnly cookies, a native app holds its own session: there
 * is no server of ours in between, and the device keystore protects it.
 */
export const supabase = createClient(
  env.supabaseUrl,
  env.supabasePublishableKey,
  {
    auth: {
      storage: Platform.OS === "web" ? undefined : new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      // Links come back through expo-linking, handled in features/auth.
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  },
);

// Refresh only while the app is in the foreground: a timer in a suspended app
// fires late or not at all, and a stale refresh can race the one on resume.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
