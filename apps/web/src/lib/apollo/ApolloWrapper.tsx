"use client";

import { HttpLink } from "@apollo/client";
import { ApolloClient, ApolloNextAppProvider, InMemoryCache } from "@apollo/client-integration-nextjs";
import type { PropsWithChildren } from "react";

import { env } from "@/config/env";

function makeClient() {
  const httpLink = new HttpLink({ uri: env.graphqlUri });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

export function ApolloWrapper({ children }: PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
