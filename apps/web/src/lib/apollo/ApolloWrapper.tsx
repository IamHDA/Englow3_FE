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

function makeClient() {
  const httpLink = new HttpLink({ uri: env.bffGraphqlUrl });

  const authLink = setContext(async (_, { headers }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      headers: {
        ...headers,
        ...(session ? { authorization: `Bearer ${session.access_token}` } : {}),
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
