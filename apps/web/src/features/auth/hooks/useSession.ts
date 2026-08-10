"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SessionState = {
  session: Session | null;
  /** True until the first read resolves, so the UI can hold its shape. */
  loading: boolean;
};

/**
 * Reads the current Supabase session and keeps it in step with sign-in and
 * sign-out. This is a real effect: it subscribes to a store outside React and
 * unsubscribes on unmount.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setState({ session: data.session, loading: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setState({ session, loading: false });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
