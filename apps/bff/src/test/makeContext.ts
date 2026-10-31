import { GraphQLError } from "graphql";

import type { GraphQLContext } from "../graphql/context.js";

type Apis = GraphQLContext["apis"];

/**
 * A resolver context for tests. A test names only the API methods its resolver
 * reaches; every other API is absent, so an unmocked call fails on the spot.
 * `token: null` is a caller with no token - `requireToken` refuses as the real one does.
 */
export function makeContext({
  token = "token",
  apis = {},
}: {
  token?: string | null;
  apis?: { [K in keyof Apis]?: Partial<Apis[K]> };
} = {}): GraphQLContext {
  return {
    token,
    requestId: "req-test",
    requireToken: () => {
      if (!token) {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return token;
    },
    // The one cast in the test suite: a resolver test cannot build a whole API
    // class, only the methods it asserts on.
    apis: apis as Apis,
  };
}
