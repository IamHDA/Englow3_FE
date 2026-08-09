import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, registerApolloClient } from "@apollo/client-integration-nextjs";

import { env } from "@/config/env";

// Server Components query through this client rather than a hook.
// RSC and client-side (ApolloWrapper) queries are kept separate: see
// https://github.com/apollographql/apollo-client-integrations/tree/main/packages/nextjs
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: env.graphqlUri }),
  });
});
