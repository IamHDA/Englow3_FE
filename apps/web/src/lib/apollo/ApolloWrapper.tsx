"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

import { finalize } from "rxjs";

import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
import { beginRequest, endRequest } from "@/shared/network/pendingRequests";

function makeClient() {
  // In the browser the request goes to this app's own /api/graphql, which adds
  // the token from the HttpOnly session cookie and passes it on to the BFF -
  // the page never holds a token. The one place this runs on a server is the
  // server render of a client component, which has no cookie to read and so
  // reaches the BFF as a guest, exactly as it did before; a relative address
  // means nothing there, so it takes the BFF's.
  const httpLink = new HttpLink({
    uri:
      typeof window === "undefined"
        ? (process.env.BFF_GRAPHQL_URL ??
          process.env.NEXT_PUBLIC_BFF_GRAPHQL_URL ??
          "http://localhost:4000/graphql")
        : "/api/graphql",
    credentials: "same-origin",
    headers: { [CSRF_HEADER]: CSRF_VALUE },
    fetchOptions: {
      keepalive: true,
    },
  });

  // Counts every operation from start to finish - success, error or
  // cancellation alike - so the app can say so when the backend is slow to
  // answer, rather than leave a skeleton up with no explanation.
  const pendingLink = new ApolloLink((operation, forward) => {
    beginRequest();
    return forward(operation).pipe(finalize(endRequest));
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Exam: {
          keyFields: ["id"],
        },
        ExamPaper: {
          keyFields: ["id"],
        },
        UserProfile: {
          keyFields: ["id"],
        },
      },
    }),
    link: ApolloLink.from([pendingLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-first",
        // After the first fetch, settle on the cache - except for a query that
        // asked for "network-only". That is a promise to go to the server every
        // time, and a blanket "cache-first" here quietly broke it: the second
        // run of a lazy query came from the cache. Onboarding saved each step
        // and then re-read the old step, so the popup never moved on.
        nextFetchPolicy: (currentFetchPolicy) =>
          currentFetchPolicy === "network-only"
            ? "network-only"
            : "cache-first",
      },
      query: {
        fetchPolicy: "cache-first",
      },
    },
  });
}

type ApolloWrapperProps = React.PropsWithChildren<{
  /**
   * The script nonce of this response (see proxy.ts). Apollo hands the data it
   * fetched on the server to the browser through an inline script; without the
   * nonce the page's policy refuses to run it and every query is fetched again.
   */
  nonce?: string;
}>;

export function ApolloWrapper({ children, nonce }: ApolloWrapperProps) {
  return (
    <ApolloNextAppProvider makeClient={makeClient} extraScriptProps={{ nonce }}>
      {children}
    </ApolloNextAppProvider>
  );
}
