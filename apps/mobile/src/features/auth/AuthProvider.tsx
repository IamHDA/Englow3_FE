import { useApolloClient } from "@apollo/client/react";
import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { setUnauthenticatedHandler } from "@/lib/apollo";
import {
  useCurrentUserQuery,
  type CurrentUserQuery,
} from "@/lib/graphql/generated";
import { supabase } from "@/lib/supabase";

import type { AuthErrorLike } from "./authErrorMessage";
import type { RegistrationInput } from "./validation";

WebBrowser.maybeCompleteAuthSession();

export type Me = CurrentUserQuery["me"];

type Result = { error: AuthErrorLike | null };

type AuthContextValue = {
  /** Still reading the stored session at start-up. */
  initializing: boolean;
  session: Session | null;
  /** The signed-in learner's profile from the BFF; null while loading or signed out. */
  me: Me | null;
  meLoading: boolean;
  meError: unknown;
  refetchMe: () => Promise<unknown>;
  /** Set after a password-recovery link opened the app: the next screen is "new password". */
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (
    input: RegistrationInput,
  ) => Promise<Result & { needsConfirmation: boolean }>;
  signInWithProvider: (provider: "google" | "facebook") => Promise<Result>;
  sendPasswordReset: (email: string) => Promise<Result>;
  resendConfirmation: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Where Supabase sends the learner back to: the app's own scheme. */
export function authRedirectUrl(path: string) {
  return Linking.createURL(path);
}

/**
 * Finishes a link that came back from Supabase: e-mail confirmation, password
 * recovery or an OAuth provider. All of them carry a PKCE `code` to exchange
 * for a session; recovery is told apart by `type=recovery` or the path.
 */
export async function completeAuthRedirect(
  url: string,
): Promise<{ recovery: boolean; error: AuthErrorLike | null } | null> {
  const parsed = Linking.parse(url);
  const params = parsed.queryParams ?? {};
  const code = typeof params.code === "string" ? params.code : null;
  const errorCode =
    typeof params.error_code === "string" ? params.error_code : null;
  if (errorCode) return { recovery: false, error: { code: errorCode } };
  if (!code) return null;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  const recovery =
    params.type === "recovery" || (parsed.path ?? "").includes("reset");
  return { recovery, error: error ?? null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setInitializing(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      if (event === "SIGNED_OUT") {
        setRecovering(false);
        void client.clearStore();
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  // Links that open the app (cold start or while running).
  useEffect(() => {
    const handle = async (url: string | null) => {
      if (!url) return;
      const outcome = await completeAuthRedirect(url);
      if (outcome?.recovery && !outcome.error) setRecovering(true);
    };
    void Linking.getInitialURL().then(handle);
    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handle(url);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      void supabase.auth.signOut();
    });
  }, []);

  const meQuery = useCurrentUserQuery({
    skip: !session,
    fetchPolicy: "cache-and-network",
  });

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error };
  }, []);

  const signUp = useCallback(async (input: RegistrationInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        emailRedirectTo: authRedirectUrl("auth/callback"),
        // The keys the database trigger reads; identical to the web route.
        data: {
          full_name: input.fullName.trim(),
          display_name: input.displayName.trim(),
          birth_date: input.birthDate,
          gender: input.gender,
        },
      },
    });
    return { error, needsConfirmation: !error && !data.session };
  }, []);

  const signInWithProvider = useCallback(
    async (provider: "google" | "facebook") => {
      const redirectTo = authRedirectUrl("auth/callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url)
        return { error: error ?? { code: "provider_disabled" } };
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      if (result.type !== "success") return { error: null };
      const outcome = await completeAuthRedirect(result.url);
      return { error: outcome?.error ?? null };
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl("auth/reset"),
    });
    return { error };
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: authRedirectUrl("auth/callback") },
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setRecovering(false);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      session,
      me: session ? (meQuery.data?.me ?? null) : null,
      meLoading: Boolean(session) && meQuery.loading && !meQuery.data,
      meError: meQuery.error,
      refetchMe: () => meQuery.refetch(),
      recovering,
      signIn,
      signUp,
      signInWithProvider,
      sendPasswordReset,
      resendConfirmation,
      updatePassword,
      signOut,
    }),
    [
      initializing,
      session,
      meQuery,
      recovering,
      signIn,
      signUp,
      signInWithProvider,
      sendPasswordReset,
      resendConfirmation,
      updatePassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

export function isBackOfficeRole(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "STAFF";
}
