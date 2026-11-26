import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { tap } from "rxjs";

import { env } from "./env";
import { supabase } from "./supabase";

/** Called when the BFF says the token is no longer good; set by the auth provider. */
let onUnauthenticated: () => void = () => {};

export function setUnauthenticatedHandler(handler: () => void) {
  onUnauthenticated = handler;
}

/**
 * The learner's current access token. `getSession` refreshes an expired token
 * before answering, so a request after the app sat in the background still
 * goes out with a valid one.
 */
export async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const authLink = new SetContextLink(async (prevContext) => {
  const token = await accessToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const unauthenticatedLink = new ApolloLink((operation, forward) =>
  forward(operation).pipe(
    tap({
      next: (result) => {
        if (
          result.errors?.some(
            (error) => error.extensions?.code === "UNAUTHENTICATED",
          )
        ) {
          onUnauthenticated();
        }
      },
    }),
  ),
);

const httpLink = new HttpLink({ uri: `${env.bffUrl}/graphql` });

export function createApolloClient() {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Exam: { keyFields: ["id"] },
        ExamPaper: { keyFields: ["id"] },
        UserProfile: { keyFields: ["id"] },
      },
    }),
    link: ApolloLink.from([unauthenticatedLink, authLink, httpLink]),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
    },
  });
}

export const apolloClient = createApolloClient();

export { CombinedGraphQLErrors };
