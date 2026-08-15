import { HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

import { env } from "@/config/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({ uri: env.bffGraphqlUrl });

  const authLink = setContext(async (_, { headers }) => {
    const supabase = await createSupabaseServerClient();
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
});
