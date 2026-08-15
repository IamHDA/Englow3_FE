import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { GraphQLError } from "graphql";

import { env } from "../config/env.js";
import { OnboardingApi } from "../modules/onboarding/onboarding.api.js";
import { UserApi } from "../modules/user/user.api.js";
import { BackendClient } from "../shared/http/backendClient.js";

export type GraphQLContext = {
  token: string | null;
  /** Fails unauthenticated callers early. Not the authorization boundary - the backend still verifies. */
  requireToken: () => string;
  apis: {
    userApi: UserApi;
    onboardingApi: OnboardingApi;
  };
};

function extractBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

// Built fresh per request: the BackendClient carries this request's token,
// and reusing it across requests would leak one user's session into another's.
export async function createContext({
  req,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> {
  const token = extractBearerToken(req.headers.authorization);
  const requestId =
    typeof req.headers["x-request-id"] === "string"
      ? req.headers["x-request-id"]
      : undefined;

  const client = new BackendClient(
    env.backendUrl,
    env.backendTimeoutMs,
    token ?? undefined,
    requestId,
  );

  return {
    token,
    requireToken: () => {
      if (!token) {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      return token;
    },
    apis: {
      userApi: new UserApi(client),
      onboardingApi: new OnboardingApi(client),
    },
  };
}
