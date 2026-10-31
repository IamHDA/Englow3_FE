"use client";

import { useApolloClient } from "@apollo/client/react";
import { useEffect } from "react";
import { errorCodeOf } from "@/shared/network/loadError";
import {
  mountServiceChecks,
  onBackendRecovered,
} from "@/shared/network/serviceAvailability";

export function ServiceRecovery() {
  const client = useApolloClient();
  useEffect(() => {
    const unsubscribe = onBackendRecovered(() => {
      // Only queries with live observers that actually failed. Never mutations,
      // stale screens or the profile (AccountProvider owns that recovery).
      for (const query of client.getObservableQueries("all").values()) {
        if (
          query.hasObservers() &&
          query.queryName !== "CurrentUser" &&
          query.getCurrentResult().error &&
          (() => {
            const error = query.getCurrentResult().error;
            const code = errorCodeOf(error);
            const status = (error as { statusCode?: number })?.statusCode;
            return code
              ? [
                  "BACKEND_UNAVAILABLE",
                  "SERVICE_UNAVAILABLE",
                  "INTERNAL_SERVER_ERROR",
                ].includes(code)
              : status == null || status >= 500;
          })()
        ) {
          void query.refetch().catch(() => {});
        }
      }
    });
    const unmount = mountServiceChecks();
    return () => {
      unsubscribe();
      unmount();
    };
  }, [client]);
  return null;
}
