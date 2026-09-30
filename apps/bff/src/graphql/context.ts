import type { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { GraphQLError } from "graphql";

import { ContentManagementApi } from "../modules/contentManagement/contentManagement.api.js";
import { DictationApi } from "../modules/dictation/dictation.api.js";
import { ExamApi } from "../modules/exam/exam.api.js";
import { FlashcardApi } from "../modules/flashcard/flashcard.api.js";
import { ProgressApi } from "../modules/progress/progress.api.js";
import { QuizApi } from "../modules/quiz/quiz.api.js";
import { SpeakingApi } from "../modules/speaking/speaking.api.js";
import { TutorApi } from "../modules/tutor/tutor.api.js";
import { OnboardingApi } from "../modules/onboarding/onboarding.api.js";
import { UserApi } from "../modules/user/user.api.js";
import { createBackendClient } from "../shared/http/backendClient.js";

export type GraphQLContext = {
  token: string | null;
  /** The id this request's backend calls travel under, so a log line can be tied back to it. */
  requestId: string;
  /** Fails unauthenticated callers early. Not the authorization boundary - the backend still verifies. */
  requireToken: () => string;
  apis: {
    userApi: UserApi;
    onboardingApi: OnboardingApi;
    examApi: ExamApi;
    flashcardApi: FlashcardApi;
    quizApi: QuizApi;
    dictationApi: DictationApi;
    progressApi: ProgressApi;
    contentManagementApi: ContentManagementApi;
    speakingApi: SpeakingApi;
    tutorApi: TutorApi;
  };
};

// Built fresh per request: the BackendClient carries this request's token,
// and reusing it across requests would leak one user's session into another's.
export async function createContext({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<GraphQLContext> {
  const { token, requestId, client } = createBackendClient(req.headers);
  res.setHeader("x-request-id", requestId);

  return {
    token,
    requestId,
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
      flashcardApi: new FlashcardApi(client),
      quizApi: new QuizApi(client),
      dictationApi: new DictationApi(client),
      progressApi: new ProgressApi(client),
      contentManagementApi: new ContentManagementApi(client),
      speakingApi: new SpeakingApi(client),
      tutorApi: new TutorApi(client),
    },
  };
}
