import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { GraphQLError } from "graphql";

import { ExamApi } from "../modules/exam/exam.api.js";
import { LearningApi } from "../modules/learning/learning.api.js";
import { SpeakingApi } from "../modules/speaking/speaking.api.js";
import { TutorApi } from "../modules/tutor/tutor.api.js";
import { OnboardingApi } from "../modules/onboarding/onboarding.api.js";
import { UserApi } from "../modules/user/user.api.js";
import { createBackendClient } from "../shared/http/backendClient.js";

export type GraphQLContext = {
  token: string | null;
  /** Fails unauthenticated callers early. Not the authorization boundary - the backend still verifies. */
  requireToken: () => string;
  apis: {
    userApi: UserApi;
    onboardingApi: OnboardingApi;
    examApi: ExamApi;
    learningApi: LearningApi;
    speakingApi: SpeakingApi;
    tutorApi: TutorApi;
  };
};

// Built fresh per request: the BackendClient carries this request's token,
// and reusing it across requests would leak one user's session into another's.
export async function createContext({
  req,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> {
  const { token, client } = createBackendClient(req.headers);

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
      examApi: new ExamApi(client),
      learningApi: new LearningApi(client),
      speakingApi: new SpeakingApi(client),
      tutorApi: new TutorApi(client),
    },
  };
}
