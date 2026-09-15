"use client";

import { HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

import { env } from "@/config/env";
import { supabase } from "@/lib/supabase/client";

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedAccessToken = session?.access_token ?? null;
    tokenExpiresAt = Date.now() + 30000;
  });
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: env.bffGraphqlUrl,
    fetchOptions: {
      keepalive: true,
    },
  });

  const authLink = setContext(async (_, { headers }) => {
    const now = Date.now();
    let token = cachedAccessToken;

    if (!token || now > tokenExpiresAt) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token ?? null;
      cachedAccessToken = token;
      tokenExpiresAt = now + 30000;
    }

    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
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
    link: authLink.concat(httpLink),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-first",
        nextFetchPolicy: "cache-first",
      },
      query: {
        fetchPolicy: "cache-first",
      },
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
