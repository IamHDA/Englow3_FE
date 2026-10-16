import { HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

import { bffGraphqlUrl } from "@/server/bff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: bffGraphqlUrl,
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        signal: AbortSignal.any([
          AbortSignal.timeout(12_000),
          ...(init?.signal ? [init.signal] : []),
        ]),
        cache: "no-store",
      }),
  });

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
