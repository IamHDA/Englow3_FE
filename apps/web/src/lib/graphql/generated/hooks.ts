/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import type * as Types from "./schemaTypes";

import { gql } from "@apollo/client";
import * as ApolloReactCommon from "@apollo/client/react";
import * as ApolloReactHooks from "@apollo/client/react";
const defaultOptions = {} as const;
export type UpdateProfileMutationVariables = Exact<{
  input: Types.UpdateProfileInput;
}>;

export type UpdateProfileMutation = {
  updateProfile: {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    gender: Types.Gender | null;
    birthDate: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    onboardingStep: Types.OnboardingStep;
    onboardingState: {
      certificateLearner: boolean | null;
      currentLevel: Types.CefrLevel | null;
      targetCertificateType: string | null;
      targetScore: number | null;
      targetDate: string | null;
      targetSkills: Array<Types.LearningSkill>;
    } | null;
  };
};

export type TutorMessageFieldsFragment = {
  id: string;
  orderNo: number;
  role: Types.TutorMessageRole;
  status: Types.TutorMessageStatus;
  content: string | null;
  errorCode: string | null;
  model: string | null;
  reported: boolean;
  createdAt: string;
  answeredAt: string | null;
};

export type TutorConversationSummaryFieldsFragment = {
  id: string;
  title: string;
  topic: string | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
};

export type TutorConversationsQueryVariables = Exact<{ [key: string]: never }>;

export type TutorConversationsQuery = {
  tutorConversations: Array<{
    id: string;
    title: string;
    topic: string | null;
    messageCount: number;
    lastMessageAt: string;
    createdAt: string;
  }>;
};

export type TutorConversationQueryVariables = Exact<{
  id: string | number;
}>;

export type TutorConversationQuery = {
  tutorConversation: {
    conversation: {
      id: string;
      title: string;
      topic: string | null;
      messageCount: number;
      lastMessageAt: string;
      createdAt: string;
    };
    messages: Array<{
      id: string;
      orderNo: number;
      role: Types.TutorMessageRole;
      status: Types.TutorMessageStatus;
      content: string | null;
      errorCode: string | null;
      model: string | null;
      reported: boolean;
      createdAt: string;
      answeredAt: string | null;
    }>;
  };
};

export type SendTutorMessageMutationVariables = Exact<{
  conversationId?: string | number | null | undefined;
  message: string;
  topic?: string | null | undefined;
}>;

export type SendTutorMessageMutation = {
  sendTutorMessage: {
    conversation: {
      id: string;
      title: string;
      topic: string | null;
      messageCount: number;
      lastMessageAt: string;
      createdAt: string;
    };
    messages: Array<{
      id: string;
      orderNo: number;
      role: Types.TutorMessageRole;
      status: Types.TutorMessageStatus;
      content: string | null;
      errorCode: string | null;
      model: string | null;
      reported: boolean;
      createdAt: string;
      answeredAt: string | null;
    }>;
  };
};

export type ArchiveTutorConversationMutationVariables = Exact<{
  id: string | number;
}>;

export type ArchiveTutorConversationMutation = {
  archiveTutorConversation: {
    id: string;
    title: string;
    topic: string | null;
    messageCount: number;
    lastMessageAt: string;
    createdAt: string;
  };
};

export type ReportTutorMessageMutationVariables = Exact<{
  conversationId: string | number;
  messageId: string | number;
  note?: string | null | undefined;
}>;

export type ReportTutorMessageMutation = {
  reportTutorMessage: {
    id: string;
    orderNo: number;
    role: Types.TutorMessageRole;
    status: Types.TutorMessageStatus;
    content: string | null;
    errorCode: string | null;
    model: string | null;
    reported: boolean;
    createdAt: string;
    answeredAt: string | null;
  };
};

export type ContentReviewFieldsFragment = {
  id: string;
  slug: string;
  title: string;
  status: Types.ContentStatus;
  itemCount: number | null;
  createdAt: string;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type AdminContentQueryVariables = Exact<{
  kind: Types.ContentKind;
  status?: Types.ContentStatus | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type AdminContentQuery = {
  adminContent: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      slug: string;
      title: string;
      status: Types.ContentStatus;
      itemCount: number | null;
      createdAt: string;
      publishedAt: string | null;
      submittedForReviewAt: string | null;
      reviewedAt: string | null;
      reviewNote: string | null;
    }>;
  };
};

export type SubmitContentForReviewMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
}>;

export type SubmitContentForReviewMutation = {
  submitContentForReview: {
    id: string;
    slug: string;
    title: string;
    status: Types.ContentStatus;
    itemCount: number | null;
    createdAt: string;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type ApproveContentMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
}>;

export type ApproveContentMutation = {
  approveContent: {
    id: string;
    slug: string;
    title: string;
    status: Types.ContentStatus;
    itemCount: number | null;
    createdAt: string;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type RejectContentMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
  note: string;
}>;

export type RejectContentMutation = {
  rejectContent: {
    id: string;
    slug: string;
    title: string;
    status: Types.ContentStatus;
    itemCount: number | null;
    createdAt: string;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type PublishContentMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
}>;

export type PublishContentMutation = {
  publishContent: {
    id: string;
    slug: string;
    title: string;
    status: Types.ContentStatus;
    itemCount: number | null;
    createdAt: string;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type ArchiveContentMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
}>;

export type ArchiveContentMutation = {
  archiveContent: {
    id: string;
    slug: string;
    title: string;
    status: Types.ContentStatus;
    itemCount: number | null;
    createdAt: string;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type DictationLessonFieldsFragment = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  targetLevel: string | null;
  sentenceCount: number;
  completedSentenceCount: number;
  totalDurationSeconds: number;
  lastPractisedAt: string | null;
};

export type DictationSentenceFieldsFragment = {
  id: string;
  orderNo: number;
  audioUrl: string;
  audioDurationSeconds: number;
  hintWordCount: number;
  hintFirstLetters: string | null;
  hintRevealWord: string | null;
  hintPartialTranscript: string | null;
  audioStartMs: number | null;
  audioEndMs: number | null;
  bestAccuracyPercent: number | null;
};

export type DictationLessonsQueryVariables = Exact<{
  topic?: string | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type DictationLessonsQuery = {
  dictationLessons: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      slug: string;
      title: string;
      topic: string;
      targetLevel: string | null;
      sentenceCount: number;
      completedSentenceCount: number;
      totalDurationSeconds: number;
      lastPractisedAt: string | null;
    }>;
  };
};

export type DictationLessonDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type DictationLessonDetailQuery = {
  dictationLesson: {
    lesson: {
      id: string;
      slug: string;
      title: string;
      topic: string;
      targetLevel: string | null;
      sentenceCount: number;
      completedSentenceCount: number;
      totalDurationSeconds: number;
      lastPractisedAt: string | null;
    };
    sentences: Array<{
      id: string;
      orderNo: number;
      audioUrl: string;
      audioDurationSeconds: number;
      hintWordCount: number;
      hintFirstLetters: string | null;
      hintRevealWord: string | null;
      hintPartialTranscript: string | null;
      audioStartMs: number | null;
      audioEndMs: number | null;
      bestAccuracyPercent: number | null;
    }>;
  };
};

export type SubmitDictationMutationVariables = Exact<{
  sentenceId: string | number;
  response: string;
}>;

export type SubmitDictationMutation = {
  submitDictation: {
    sentenceId: string;
    correctText: string;
    translationVi: string | null;
    response: string;
    accuracyPercent: number;
    correctWordCount: number;
    totalWordCount: number;
  };
};

export type DictationStatsQueryVariables = Exact<{
  periodDays?: number | null | undefined;
}>;

export type DictationStatsQuery = {
  dictationStats: {
    periodDays: number;
    lessonsCompleted: number;
    averageAccuracyPercent: number;
    listeningSeconds: number;
    sentencesPractised: number;
    streakDays: number;
    activity: Array<{
      day: string;
      accuracyPercent: number;
      attemptCount: number;
    }>;
    missedWords: Array<{
      word: string;
      missedCount: number;
      correctCount: number;
      accuracyPercent: number;
    }>;
    difficultSentences: Array<{
      sentenceId: string;
      text: string;
      topic: string;
      accuracyPercent: number;
      attemptCount: number;
    }>;
    history: Array<{
      day: string;
      lessonId: string;
      lessonTitle: string;
      sentenceCount: number;
      accuracyPercent: number;
      listeningSeconds: number;
    }>;
  };
};

export type DictationMistakesQueryVariables = Exact<{ [key: string]: never }>;

export type DictationMistakesQuery = {
  dictationMistakes: Array<{
    sentenceId: string;
    text: string;
    audioUrl: string;
    audioDurationSeconds: number;
    lessonId: string;
    lessonTitle: string;
    bestAccuracyPercent: number;
    attemptCount: number;
    lastResponse: string | null;
  }>;
};

export type AdminExamFieldsFragment = {
  id: string;
  title: string;
  examType: Types.ExamType;
  certificateType: Types.CertificateType | null;
  certificateVariant: Types.CertificateVariant | null;
  targetLevel: Types.TargetLevel | null;
  status: Types.ExamStatus;
  versionNumber: number;
  createdByUserId: string;
  publishedAt: string | null;
  createdAt: string;
  submittedForReviewAt: string | null;
  reviewNote: string | null;
};

export type AdminExamsQueryVariables = Exact<{
  status?: Types.ExamStatus | null | undefined;
  examType?: Types.ExamType | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type AdminExamsQuery = {
  adminExams: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      title: string;
      examType: Types.ExamType;
      certificateType: Types.CertificateType | null;
      certificateVariant: Types.CertificateVariant | null;
      targetLevel: Types.TargetLevel | null;
      status: Types.ExamStatus;
      versionNumber: number;
      createdByUserId: string;
      publishedAt: string | null;
      createdAt: string;
      submittedForReviewAt: string | null;
      reviewNote: string | null;
    }>;
  };
};

export type AdminExamShellFieldsFragment = {
  id: string;
  title: string;
  status: Types.ExamStatus;
  versionNumber: number;
  publishedAt: string | null;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type PublishExamMutationVariables = Exact<{
  id: string | number;
}>;

export type PublishExamMutation = {
  publishExam: {
    id: string;
    title: string;
    status: Types.ExamStatus;
    versionNumber: number;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type ArchiveExamMutationVariables = Exact<{
  id: string | number;
}>;

export type ArchiveExamMutation = {
  archiveExam: {
    id: string;
    title: string;
    status: Types.ExamStatus;
    versionNumber: number;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type SubmitExamForReviewMutationVariables = Exact<{
  id: string | number;
}>;

export type SubmitExamForReviewMutation = {
  submitExamForReview: {
    id: string;
    title: string;
    status: Types.ExamStatus;
    versionNumber: number;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type ApproveExamMutationVariables = Exact<{
  id: string | number;
}>;

export type ApproveExamMutation = {
  approveExam: {
    id: string;
    title: string;
    status: Types.ExamStatus;
    versionNumber: number;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type RejectExamMutationVariables = Exact<{
  id: string | number;
  note: string;
}>;

export type RejectExamMutation = {
  rejectExam: {
    id: string;
    title: string;
    status: Types.ExamStatus;
    versionNumber: number;
    publishedAt: string | null;
    submittedForReviewAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
  };
};

export type ExamAttemptFieldsFragment = {
  id: string;
  examId: string;
  status: Types.ExamAttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  scoredAt: string | null;
  rawScore: number | null;
  maxRawScore: number | null;
  scorePercentage: number | null;
  correctAnswerCount: number | null;
  questionCount: number;
  resumed: boolean;
  examTitle: string | null;
};

export type AttemptReviewFieldsFragment = {
  questionId: string;
  selectedOptionIds: Array<string>;
  correctOptionIds: Array<string>;
  correct: boolean;
  awardedRawScore: number;
  explanation: string | null;
  options: Array<{
    optionId: string;
    correct: boolean;
    explanation: string | null;
  }>;
};

export type StartExamAttemptMutationVariables = Exact<{
  examId: string | number;
}>;

export type StartExamAttemptMutation = {
  startExamAttempt: {
    id: string;
    examId: string;
    status: Types.ExamAttemptStatus;
    startedAt: string;
    expiresAt: string;
    submittedAt: string | null;
    scoredAt: string | null;
    rawScore: number | null;
    maxRawScore: number | null;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
  };
};

export type AttemptPaperQueryVariables = Exact<{
  attemptId: string | number;
}>;

export type AttemptPaperQuery = {
  attemptPaper: {
    id: string;
    title: string;
    description: string;
    examType: Types.ExamType;
    certificateType: Types.CertificateType | null;
    certificateVariant: Types.CertificateVariant | null;
    targetLevel: Types.TargetLevel | null;
    durationSeconds: number;
    maxRawScore: number;
    passScore: number | null;
    versionNumber: number;
    sections: Array<{
      id: string;
      sectionType: string;
      orderNo: number;
      maxRawScore: number;
      scoredByCriteria: boolean;
      timeLimitSeconds: number | null;
      parts: Array<{
        id: string;
        orderNo: number;
        title: string;
        instruction: string | null;
        content: string | null;
        audioUrl: string | null;
        imageUrl: string | null;
        questionSets: Array<{
          id: string;
          title: string | null;
          instruction: string | null;
          orderNo: number;
          content: string | null;
          audioUrl: string | null;
          imageUrl: string | null;
          questions: Array<{
            id: string;
            questionType: string;
            content: string;
            difficultyLevel: string;
            skillType: string;
            questionCategory: string | null;
            orderNo: number;
            maxRawScore: number;
            options: Array<{ id: string; content: string; orderNo: number }>;
          }>;
        }>;
      }>;
    }>;
  };
};

export type SubmitExamAttemptMutationVariables = Exact<{
  attemptId: string | number;
  answers: Array<Types.SubmitAnswerInput> | Types.SubmitAnswerInput;
}>;

export type SubmitExamAttemptMutation = {
  submitExamAttempt: {
    id: string;
    examId: string;
    status: Types.ExamAttemptStatus;
    startedAt: string;
    expiresAt: string;
    submittedAt: string | null;
    scoredAt: string | null;
    rawScore: number | null;
    maxRawScore: number | null;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
    questions: Array<{
      questionId: string;
      selectedOptionIds: Array<string>;
      correctOptionIds: Array<string>;
      correct: boolean;
      awardedRawScore: number;
      explanation: string | null;
      options: Array<{
        optionId: string;
        correct: boolean;
        explanation: string | null;
      }>;
    }>;
  };
};

export type ExamAttemptResultQueryVariables = Exact<{
  id: string | number;
}>;

export type ExamAttemptResultQuery = {
  examAttempt: {
    id: string;
    examId: string;
    status: Types.ExamAttemptStatus;
    startedAt: string;
    expiresAt: string;
    submittedAt: string | null;
    scoredAt: string | null;
    rawScore: number | null;
    maxRawScore: number | null;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
    questions: Array<{
      questionId: string;
      selectedOptionIds: Array<string>;
      correctOptionIds: Array<string>;
      correct: boolean;
      awardedRawScore: number;
      explanation: string | null;
      options: Array<{
        optionId: string;
        correct: boolean;
        explanation: string | null;
      }>;
    }>;
  };
};

export type ExamAttemptHistoryQueryVariables = Exact<{
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type ExamAttemptHistoryQuery = {
  examAttempts: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      examId: string;
      status: Types.ExamAttemptStatus;
      startedAt: string;
      expiresAt: string;
      submittedAt: string | null;
      scoredAt: string | null;
      rawScore: number | null;
      maxRawScore: number | null;
      scorePercentage: number | null;
      correctAnswerCount: number | null;
      questionCount: number;
      resumed: boolean;
      examTitle: string | null;
    }>;
  };
};

export type ExamLibraryQueryVariables = Exact<{
  examType?: Types.ExamType | null | undefined;
  certificateType?: Types.CertificateType | null | undefined;
  certificateVariant?: Types.CertificateVariant | null | undefined;
  targetLevel?: Types.TargetLevel | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type ExamLibraryQuery = {
  exams: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      title: string;
      description: string;
      examType: Types.ExamType;
      certificateType: Types.CertificateType | null;
      certificateVariant: Types.CertificateVariant | null;
      targetLevel: Types.TargetLevel | null;
      durationSeconds: number;
      maxRawScore: number;
      passScore: number | null;
      questionCount: number;
      status: Types.ExamStatus;
      publishedAt: string | null;
      bestScorePercentage: number | null;
      attemptStatus: Types.LearnerAttemptStatus;
    }>;
  };
};

export type ExamDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type ExamDetailQuery = {
  exam: {
    id: string;
    title: string;
    description: string;
    examType: Types.ExamType;
    certificateType: Types.CertificateType | null;
    certificateVariant: Types.CertificateVariant | null;
    targetLevel: Types.TargetLevel | null;
    durationSeconds: number;
    maxRawScore: number;
    passScore: number | null;
    questionCount: number;
    status: Types.ExamStatus;
    publishedAt: string | null;
    bestScorePercentage: number | null;
    attemptStatus: Types.LearnerAttemptStatus;
  } | null;
};

export type PlacementExamQueryVariables = Exact<{ [key: string]: never }>;

export type PlacementExamQuery = {
  placementExam: {
    id: string;
    title: string;
    description: string;
    durationSeconds: number;
    questionCount: number;
  };
};

export type FlashcardSetFieldsFragment = {
  id: string;
  slug: string;
  name: string;
  description: string;
  topic: string;
  targetLevel: string | null;
  cardCount: number;
  dueCount: number;
  masteredCount: number;
  lastStudiedAt: string | null;
};

export type FlashcardFieldsFragment = {
  id: string;
  orderNo: number;
  lemma: string;
  partOfSpeech: string;
  senseLabel: string;
  ipaUs: string;
  ipaUk: string | null;
  audioUsUrl: string | null;
  audioUkUrl: string | null;
  definitionEn: string;
  definitionVi: string;
  exampleSentence: string;
  exampleTranslationVi: string | null;
  mnemonicTipVi: string | null;
  cefrLevel: string | null;
  status: Types.FlashcardReviewStatus;
  dueAt: string | null;
  lapseCount: number;
};

export type FlashcardSetsQueryVariables = Exact<{
  topic?: string | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type FlashcardSetsQuery = {
  flashcardSets: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      slug: string;
      name: string;
      description: string;
      topic: string;
      targetLevel: string | null;
      cardCount: number;
      dueCount: number;
      masteredCount: number;
      lastStudiedAt: string | null;
    }>;
  };
};

export type FlashcardSetDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type FlashcardSetDetailQuery = {
  flashcardSet: {
    set: {
      id: string;
      slug: string;
      name: string;
      description: string;
      topic: string;
      targetLevel: string | null;
      cardCount: number;
      dueCount: number;
      masteredCount: number;
      lastStudiedAt: string | null;
    };
    cards: Array<{
      id: string;
      orderNo: number;
      lemma: string;
      partOfSpeech: string;
      senseLabel: string;
      ipaUs: string;
      ipaUk: string | null;
      audioUsUrl: string | null;
      audioUkUrl: string | null;
      definitionEn: string;
      definitionVi: string;
      exampleSentence: string;
      exampleTranslationVi: string | null;
      mnemonicTipVi: string | null;
      cefrLevel: string | null;
      status: Types.FlashcardReviewStatus;
      dueAt: string | null;
      lapseCount: number;
    }>;
  };
};

export type FlashcardStudyQueueQueryVariables = Exact<{
  setId: string | number;
  limit?: number | null | undefined;
}>;

export type FlashcardStudyQueueQuery = {
  flashcardStudyQueue: Array<{
    id: string;
    orderNo: number;
    lemma: string;
    partOfSpeech: string;
    senseLabel: string;
    ipaUs: string;
    ipaUk: string | null;
    audioUsUrl: string | null;
    audioUkUrl: string | null;
    definitionEn: string;
    definitionVi: string;
    exampleSentence: string;
    exampleTranslationVi: string | null;
    mnemonicTipVi: string | null;
    cefrLevel: string | null;
    status: Types.FlashcardReviewStatus;
    dueAt: string | null;
    lapseCount: number;
  }>;
};

export type RateFlashcardMutationVariables = Exact<{
  flashcardId: string | number;
  rating: Types.ReviewRating;
  timeSpentSeconds: number;
}>;

export type RateFlashcardMutation = {
  rateFlashcard: {
    flashcardId: string;
    status: Types.FlashcardReviewStatus;
    repetitions: number;
    intervalDays: number;
    dueAt: string;
    lapseCount: number;
  };
};

export type FlashcardStatsQueryVariables = Exact<{
  periodDays?: number | null | undefined;
}>;

export type FlashcardStatsQuery = {
  flashcardStats: {
    periodDays: number;
    cardsStudied: number;
    retentionPercent: number;
    studySeconds: number;
    streakDays: number;
    activity: Array<{ day: string; cardCount: number }>;
    difficultCards: Array<{
      flashcardId: string;
      lemma: string;
      setName: string;
      lapseCount: number;
      lastReviewed: string | null;
    }>;
    history: Array<{
      day: string;
      setId: string;
      setName: string;
      cardCount: number;
      recallPercent: number;
      studySeconds: number;
    }>;
  };
};

export type LearningPurposesQueryVariables = Exact<{ [key: string]: never }>;

export type LearningPurposesQuery = {
  learningPurposes: Array<{
    id: number;
    purposeCode: string;
    displayName: string;
  }>;
};

export type OnboardingStateFieldsFragment = {
  learningPurposeIds: Array<number>;
  certificateLearner: boolean | null;
  targetCertificateType: string | null;
  currentLevel: Types.CefrLevel | null;
  targetScore: number | null;
  targetDate: string | null;
  targetSkills: Array<Types.LearningSkill>;
};

export type SelectLearningPurposesMutationVariables = Exact<{
  purposeIds: Array<number> | number;
}>;

export type SelectLearningPurposesMutation = {
  selectLearningPurposes: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type SetCertificateTargetMutationVariables = Exact<{
  certificateType: Types.TargetCertificate;
}>;

export type SetCertificateTargetMutation = {
  setCertificateTarget: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type SetCurrentLevelMutationVariables = Exact<{
  level: Types.CefrLevel;
}>;

export type SetCurrentLevelMutation = {
  setCurrentLevel: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type SetLearningGoalMutationVariables = Exact<{
  input: Types.LearningGoalInput;
}>;

export type SetLearningGoalMutation = {
  setLearningGoal: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type SelectTargetSkillsMutationVariables = Exact<{
  skills: Array<Types.LearningSkill> | Types.LearningSkill;
}>;

export type SelectTargetSkillsMutation = {
  selectTargetSkills: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type CompleteOnboardingMutationVariables = Exact<{
  [key: string]: never;
}>;

export type CompleteOnboardingMutation = {
  completeOnboarding: {
    learningPurposeIds: Array<number>;
    certificateLearner: boolean | null;
    targetCertificateType: string | null;
    currentLevel: Types.CefrLevel | null;
    targetScore: number | null;
    targetDate: string | null;
    targetSkills: Array<Types.LearningSkill>;
  };
};

export type SpeakingPromptFieldsFragment = {
  id: string;
  slug: string;
  title: string;
  category: string;
  targetLevel: string | null;
  referenceText: string;
  ipaTranscript: string | null;
  translationVi: string | null;
  phonemeTarget: string | null;
  tips: Array<string>;
  bestScorePercent: number | null;
};

export type SpeakingAttemptFieldsFragment = {
  id: string;
  speakingPromptId: string;
  promptTitle: string;
  referenceText: string;
  status: Types.SpeakingAttemptStatus;
  audioUrl: string;
  recognizedText: string | null;
  accuracyPercent: number | null;
  fluencyPercent: number | null;
  completenessPercent: number | null;
  prosodyPercent: number | null;
  pronunciationPercent: number | null;
  errorCode: string | null;
  createdAt: string;
  assessedAt: string | null;
  words: Array<{
    orderNo: number;
    word: string;
    accuracyPercent: number | null;
    errorType: string | null;
    offsetMs: number | null;
    durationMs: number | null;
    phonemes: Array<{ phoneme: string; accuracy: number | null }>;
  }>;
};

export type SpeakingPromptsQueryVariables = Exact<{
  category?: string | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type SpeakingPromptsQuery = {
  speakingPrompts: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      slug: string;
      title: string;
      category: string;
      targetLevel: string | null;
      referenceText: string;
      ipaTranscript: string | null;
      translationVi: string | null;
      phonemeTarget: string | null;
      tips: Array<string>;
      bestScorePercent: number | null;
    }>;
  };
};

export type SpeakingPromptQueryVariables = Exact<{
  id: string | number;
}>;

export type SpeakingPromptQuery = {
  speakingPrompt: {
    id: string;
    slug: string;
    title: string;
    category: string;
    targetLevel: string | null;
    referenceText: string;
    ipaTranscript: string | null;
    translationVi: string | null;
    phonemeTarget: string | null;
    tips: Array<string>;
    bestScorePercent: number | null;
  };
};

export type SpeakingAttemptQueryVariables = Exact<{
  id: string | number;
}>;

export type SpeakingAttemptQuery = {
  speakingAttempt: {
    id: string;
    speakingPromptId: string;
    promptTitle: string;
    referenceText: string;
    status: Types.SpeakingAttemptStatus;
    audioUrl: string;
    recognizedText: string | null;
    accuracyPercent: number | null;
    fluencyPercent: number | null;
    completenessPercent: number | null;
    prosodyPercent: number | null;
    pronunciationPercent: number | null;
    errorCode: string | null;
    createdAt: string;
    assessedAt: string | null;
    words: Array<{
      orderNo: number;
      word: string;
      accuracyPercent: number | null;
      errorType: string | null;
      offsetMs: number | null;
      durationMs: number | null;
      phonemes: Array<{ phoneme: string; accuracy: number | null }>;
    }>;
  };
};

export type SpeakingAttemptsQueryVariables = Exact<{
  promptId: string | number;
}>;

export type SpeakingAttemptsQuery = {
  speakingAttempts: Array<{
    id: string;
    speakingPromptId: string;
    promptTitle: string;
    referenceText: string;
    status: Types.SpeakingAttemptStatus;
    audioUrl: string;
    recognizedText: string | null;
    accuracyPercent: number | null;
    fluencyPercent: number | null;
    completenessPercent: number | null;
    prosodyPercent: number | null;
    pronunciationPercent: number | null;
    errorCode: string | null;
    createdAt: string;
    assessedAt: string | null;
    words: Array<{
      orderNo: number;
      word: string;
      accuracyPercent: number | null;
      errorType: string | null;
      offsetMs: number | null;
      durationMs: number | null;
      phonemes: Array<{ phoneme: string; accuracy: number | null }>;
    }>;
  }>;
};

export type StartSpeakingAttemptMutationVariables = Exact<{
  promptId: string | number;
  contentType: string;
  contentLength: number;
}>;

export type StartSpeakingAttemptMutation = {
  startSpeakingAttempt: {
    attemptId: string;
    uploadUrl: string;
    contentType: string;
    expiresInSeconds: number;
  };
};

export type SubmitSpeakingAttemptMutationVariables = Exact<{
  attemptId: string | number;
}>;

export type SubmitSpeakingAttemptMutation = {
  submitSpeakingAttempt: {
    id: string;
    speakingPromptId: string;
    promptTitle: string;
    referenceText: string;
    status: Types.SpeakingAttemptStatus;
    audioUrl: string;
    recognizedText: string | null;
    accuracyPercent: number | null;
    fluencyPercent: number | null;
    completenessPercent: number | null;
    prosodyPercent: number | null;
    pronunciationPercent: number | null;
    errorCode: string | null;
    createdAt: string;
    assessedAt: string | null;
    words: Array<{
      orderNo: number;
      word: string;
      accuracyPercent: number | null;
      errorType: string | null;
      offsetMs: number | null;
      durationMs: number | null;
      phonemes: Array<{ phoneme: string; accuracy: number | null }>;
    }>;
  };
};

export type DailyPathQueryVariables = Exact<{ [key: string]: never }>;

export type DailyPathQuery = {
  dailyPath: {
    streakDays: number;
    totalXp: number;
    level: number;
    xpIntoLevel: number;
    levelCostXp: number;
    tasks: Array<{
      kind: Types.DailyTaskKind;
      status: Types.DailyTaskStatus;
      targetId: string;
      title: string;
      order: number;
      unitsRemaining: number;
      unitsDoneToday: number;
      completionPercent: number | null;
      xpReward: number;
    }>;
    quests: Array<{
      kind: Types.DailyQuestKind;
      progress: number;
      target: number;
      completed: boolean;
    }>;
  };
};

export type QuizFieldsFragment = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  targetLevel: string | null;
  timeLimitSeconds: number;
  passingScorePercent: number;
  questionCount: number;
  bestScorePercent: number | null;
  attemptCount: number;
};

export type QuizAttemptFieldsFragment = {
  id: string;
  quizId: string;
  quizTitle: string;
  status: Types.QuizAttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number;
  scorePercentage: number | null;
  correctAnswerCount: number | null;
  questionCount: number;
  passed: boolean | null;
  resumed: boolean;
};

export type QuizReviewFieldsFragment = {
  questionId: string;
  questionType: Types.QuizQuestionType;
  prompt: string;
  userAnswerText: string;
  correctAnswerText: string;
  correct: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation: string;
};

export type QuizzesQueryVariables = Exact<{
  category?: string | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;

export type QuizzesQuery = {
  quizzes: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    items: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      category: string;
      targetLevel: string | null;
      timeLimitSeconds: number;
      passingScorePercent: number;
      questionCount: number;
      bestScorePercent: number | null;
      attemptCount: number;
    }>;
  };
};

export type StartQuizAttemptMutationVariables = Exact<{
  quizId: string | number;
}>;

export type StartQuizAttemptMutation = {
  startQuizAttempt: {
    id: string;
    quizId: string;
    quizTitle: string;
    status: Types.QuizAttemptStatus;
    startedAt: string;
    expiresAt: string;
    submittedAt: string | null;
    score: number | null;
    maxScore: number;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    passed: boolean | null;
    resumed: boolean;
  };
};

export type QuizPaperQueryVariables = Exact<{
  attemptId: string | number;
}>;

export type QuizPaperQuery = {
  quizPaper: {
    attemptId: string;
    quizId: string;
    title: string;
    description: string;
    timeLimitSeconds: number;
    expiresAt: string;
    questions: Array<{
      id: string;
      orderNo: number;
      questionType: Types.QuizQuestionType;
      title: string;
      prompt: string;
      points: number;
      beforeText: string | null;
      afterText: string | null;
      originalSentence: string | null;
      rewriteKeyword: string | null;
      wordBank: Array<string>;
      scrambledWords: Array<string>;
      leftTexts: Array<string>;
      rightTexts: Array<string>;
      options: Array<{
        id: string;
        orderNo: number;
        label: string;
        content: string;
      }>;
    }>;
  };
};

export type SubmitQuizAttemptMutationVariables = Exact<{
  attemptId: string | number;
  answers: Array<Types.QuizAnswerInput> | Types.QuizAnswerInput;
}>;

export type SubmitQuizAttemptMutation = {
  submitQuizAttempt: {
    id: string;
    quizId: string;
    quizTitle: string;
    status: Types.QuizAttemptStatus;
    startedAt: string;
    expiresAt: string;
    submittedAt: string | null;
    score: number | null;
    maxScore: number;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    passed: boolean | null;
    resumed: boolean;
    reviews: Array<{
      questionId: string;
      questionType: Types.QuizQuestionType;
      prompt: string;
      userAnswerText: string;
      correctAnswerText: string;
      correct: boolean;
      pointsEarned: number;
      pointsPossible: number;
      explanation: string;
    }>;
  };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  me: {
    id: string;
    email: string;
    fullName: string;
    displayName: string;
    gender: Types.Gender | null;
    birthDate: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    onboardingStep: Types.OnboardingStep;
    role: Types.Role;
    onboardingState: {
      certificateLearner: boolean | null;
      currentLevel: Types.CefrLevel | null;
      targetCertificateType: string | null;
      targetScore: number | null;
      targetDate: string | null;
      targetSkills: Array<Types.LearningSkill>;
    } | null;
  };
};

export const TutorMessageFieldsFragmentDoc = gql`
  fragment TutorMessageFields on TutorMessage {
    id
    orderNo
    role
    status
    content
    errorCode
    model
    reported
    createdAt
    answeredAt
  }
`;
export const TutorConversationSummaryFieldsFragmentDoc = gql`
  fragment TutorConversationSummaryFields on TutorConversationSummary {
    id
    title
    topic
    messageCount
    lastMessageAt
    createdAt
  }
`;
export const ContentReviewFieldsFragmentDoc = gql`
  fragment ContentReviewFields on ContentReview {
    id
    slug
    title
    status
    itemCount
    createdAt
    publishedAt
    submittedForReviewAt
    reviewedAt
    reviewNote
  }
`;
export const DictationLessonFieldsFragmentDoc = gql`
  fragment DictationLessonFields on DictationLesson {
    id
    slug
    title
    topic
    targetLevel
    sentenceCount
    completedSentenceCount
    totalDurationSeconds
    lastPractisedAt
  }
`;
export const DictationSentenceFieldsFragmentDoc = gql`
  fragment DictationSentenceFields on DictationSentence {
    id
    orderNo
    audioUrl
    audioDurationSeconds
    hintWordCount
    hintFirstLetters
    hintRevealWord
    hintPartialTranscript
    audioStartMs
    audioEndMs
    bestAccuracyPercent
  }
`;
export const AdminExamFieldsFragmentDoc = gql`
  fragment AdminExamFields on ExamListItem {
    id
    title
    examType
    certificateType
    certificateVariant
    targetLevel
    status
    versionNumber
    createdByUserId
    publishedAt
    createdAt
    submittedForReviewAt
    reviewNote
  }
`;
export const AdminExamShellFieldsFragmentDoc = gql`
  fragment AdminExamShellFields on Exam {
    id
    title
    status
    versionNumber
    publishedAt
    submittedForReviewAt
    reviewedAt
    reviewNote
  }
`;
export const ExamAttemptFieldsFragmentDoc = gql`
  fragment ExamAttemptFields on ExamAttempt {
    id
    examId
    status
    startedAt
    expiresAt
    submittedAt
    scoredAt
    rawScore
    maxRawScore
    scorePercentage
    correctAnswerCount
    questionCount
    resumed
    examTitle
  }
`;
export const AttemptReviewFieldsFragmentDoc = gql`
  fragment AttemptReviewFields on AttemptQuestionReview {
    questionId
    selectedOptionIds
    correctOptionIds
    correct
    awardedRawScore
    explanation
    options {
      optionId
      correct
      explanation
    }
  }
`;
export const FlashcardSetFieldsFragmentDoc = gql`
  fragment FlashcardSetFields on FlashcardSet {
    id
    slug
    name
    description
    topic
    targetLevel
    cardCount
    dueCount
    masteredCount
    lastStudiedAt
  }
`;
export const FlashcardFieldsFragmentDoc = gql`
  fragment FlashcardFields on Flashcard {
    id
    orderNo
    lemma
    partOfSpeech
    senseLabel
    ipaUs
    ipaUk
    audioUsUrl
    audioUkUrl
    definitionEn
    definitionVi
    exampleSentence
    exampleTranslationVi
    mnemonicTipVi
    cefrLevel
    status
    dueAt
    lapseCount
  }
`;
export const OnboardingStateFieldsFragmentDoc = gql`
  fragment OnboardingStateFields on OnboardingState {
    learningPurposeIds
    certificateLearner
    targetCertificateType
    currentLevel
    targetScore
    targetDate
    targetSkills
  }
`;
export const SpeakingPromptFieldsFragmentDoc = gql`
  fragment SpeakingPromptFields on SpeakingPrompt {
    id
    slug
    title
    category
    targetLevel
    referenceText
    ipaTranscript
    translationVi
    phonemeTarget
    tips
    bestScorePercent
  }
`;
export const SpeakingAttemptFieldsFragmentDoc = gql`
  fragment SpeakingAttemptFields on SpeakingAttempt {
    id
    speakingPromptId
    promptTitle
    referenceText
    status
    audioUrl
    recognizedText
    accuracyPercent
    fluencyPercent
    completenessPercent
    prosodyPercent
    pronunciationPercent
    errorCode
    createdAt
    assessedAt
    words {
      orderNo
      word
      accuracyPercent
      errorType
      offsetMs
      durationMs
      phonemes {
        phoneme
        accuracy
      }
    }
  }
`;
export const QuizFieldsFragmentDoc = gql`
  fragment QuizFields on Quiz {
    id
    slug
    title
    description
    category
    targetLevel
    timeLimitSeconds
    passingScorePercent
    questionCount
    bestScorePercent
    attemptCount
  }
`;
export const QuizAttemptFieldsFragmentDoc = gql`
  fragment QuizAttemptFields on QuizAttempt {
    id
    quizId
    quizTitle
    status
    startedAt
    expiresAt
    submittedAt
    score
    maxScore
    scorePercentage
    correctAnswerCount
    questionCount
    passed
    resumed
  }
`;
export const QuizReviewFieldsFragmentDoc = gql`
  fragment QuizReviewFields on QuizQuestionReview {
    questionId
    questionType
    prompt
    userAnswerText
    correctAnswerText
    correct
    pointsEarned
    pointsPossible
    explanation
  }
`;
export const UpdateProfileDocument = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      fullName
      displayName
      gender
      birthDate
      avatarUrl
      bannerUrl
      onboardingStep
      onboardingState {
        certificateLearner
        currentLevel
        targetCertificateType
        targetScore
        targetDate
        targetSkills
      }
    }
  }
`;
export type UpdateProfileMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >,
) => Promise<any>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >(UpdateProfileDocument, options);
}
export type UpdateProfileMutationHookResult = ReturnType<
  typeof useUpdateProfileMutation
>;
export type UpdateProfileMutationResult =
  ApolloReactCommon.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    UpdateProfileMutation,
    UpdateProfileMutationVariables
  >;
export const TutorConversationsDocument = gql`
  query TutorConversations {
    tutorConversations {
      ...TutorConversationSummaryFields
    }
  }
  ${TutorConversationSummaryFieldsFragmentDoc}
`;

/**
 * __useTutorConversationsQuery__
 *
 * To run a query within a React component, call `useTutorConversationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTutorConversationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTutorConversationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTutorConversationsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >(TutorConversationsDocument, options);
}
export function useTutorConversationsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >(TutorConversationsDocument, options);
}
export function useTutorConversationsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  TutorConversationsQuery,
  TutorConversationsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useTutorConversationsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        TutorConversationsQuery,
        TutorConversationsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  TutorConversationsQuery | undefined,
  TutorConversationsQueryVariables
>;
export function useTutorConversationsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        TutorConversationsQuery,
        TutorConversationsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    TutorConversationsQuery,
    TutorConversationsQueryVariables
  >(TutorConversationsDocument, options as any);
}
export type TutorConversationsQueryHookResult = ReturnType<
  typeof useTutorConversationsQuery
>;
export type TutorConversationsLazyQueryHookResult = ReturnType<
  typeof useTutorConversationsLazyQuery
>;
export type TutorConversationsSuspenseQueryHookResult = ReturnType<
  typeof useTutorConversationsSuspenseQuery
>;
export type TutorConversationsQueryResult = ApolloReactCommon.QueryResult<
  TutorConversationsQuery,
  TutorConversationsQueryVariables
>;
export const TutorConversationDocument = gql`
  query TutorConversation($id: ID!) {
    tutorConversation(id: $id) {
      conversation {
        ...TutorConversationSummaryFields
      }
      messages {
        ...TutorMessageFields
      }
    }
  }
  ${TutorConversationSummaryFieldsFragmentDoc}
  ${TutorMessageFieldsFragmentDoc}
`;

/**
 * __useTutorConversationQuery__
 *
 * To run a query within a React component, call `useTutorConversationQuery` and pass it any options that fit your needs.
 * When your component renders, `useTutorConversationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTutorConversationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTutorConversationQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    TutorConversationQuery,
    TutorConversationQueryVariables
  > &
    (
      | { variables: TutorConversationQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    TutorConversationQuery,
    TutorConversationQueryVariables
  >(TutorConversationDocument, options);
}
export function useTutorConversationLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    TutorConversationQuery,
    TutorConversationQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    TutorConversationQuery,
    TutorConversationQueryVariables
  >(TutorConversationDocument, options);
}
export function useTutorConversationSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    TutorConversationQuery,
    TutorConversationQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  TutorConversationQuery,
  TutorConversationQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useTutorConversationSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        TutorConversationQuery,
        TutorConversationQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  TutorConversationQuery | undefined,
  TutorConversationQueryVariables
>;
export function useTutorConversationSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        TutorConversationQuery,
        TutorConversationQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    TutorConversationQuery,
    TutorConversationQueryVariables
  >(TutorConversationDocument, options as any);
}
export type TutorConversationQueryHookResult = ReturnType<
  typeof useTutorConversationQuery
>;
export type TutorConversationLazyQueryHookResult = ReturnType<
  typeof useTutorConversationLazyQuery
>;
export type TutorConversationSuspenseQueryHookResult = ReturnType<
  typeof useTutorConversationSuspenseQuery
>;
export type TutorConversationQueryResult = ApolloReactCommon.QueryResult<
  TutorConversationQuery,
  TutorConversationQueryVariables
>;
export const SendTutorMessageDocument = gql`
  mutation SendTutorMessage(
    $conversationId: ID
    $message: String!
    $topic: String
  ) {
    sendTutorMessage(
      conversationId: $conversationId
      message: $message
      topic: $topic
    ) {
      conversation {
        ...TutorConversationSummaryFields
      }
      messages {
        ...TutorMessageFields
      }
    }
  }
  ${TutorConversationSummaryFieldsFragmentDoc}
  ${TutorMessageFieldsFragmentDoc}
`;
export type SendTutorMessageMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SendTutorMessageMutation,
    SendTutorMessageMutationVariables
  >,
) => Promise<any>;

/**
 * __useSendTutorMessageMutation__
 *
 * To run a mutation, you first call `useSendTutorMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendTutorMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendTutorMessageMutation, { data, loading, error }] = useSendTutorMessageMutation({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *      message: // value for 'message'
 *      topic: // value for 'topic'
 *   },
 * });
 */
export function useSendTutorMessageMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SendTutorMessageMutation,
    SendTutorMessageMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SendTutorMessageMutation,
    SendTutorMessageMutationVariables
  >(SendTutorMessageDocument, options);
}
export type SendTutorMessageMutationHookResult = ReturnType<
  typeof useSendTutorMessageMutation
>;
export type SendTutorMessageMutationResult =
  ApolloReactCommon.MutationResult<SendTutorMessageMutation>;
export type SendTutorMessageMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SendTutorMessageMutation,
    SendTutorMessageMutationVariables
  >;
export const ArchiveTutorConversationDocument = gql`
  mutation ArchiveTutorConversation($id: ID!) {
    archiveTutorConversation(id: $id) {
      ...TutorConversationSummaryFields
    }
  }
  ${TutorConversationSummaryFieldsFragmentDoc}
`;
export type ArchiveTutorConversationMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ArchiveTutorConversationMutation,
    ArchiveTutorConversationMutationVariables
  >,
) => Promise<any>;

/**
 * __useArchiveTutorConversationMutation__
 *
 * To run a mutation, you first call `useArchiveTutorConversationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveTutorConversationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveTutorConversationMutation, { data, loading, error }] = useArchiveTutorConversationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveTutorConversationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ArchiveTutorConversationMutation,
    ArchiveTutorConversationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ArchiveTutorConversationMutation,
    ArchiveTutorConversationMutationVariables
  >(ArchiveTutorConversationDocument, options);
}
export type ArchiveTutorConversationMutationHookResult = ReturnType<
  typeof useArchiveTutorConversationMutation
>;
export type ArchiveTutorConversationMutationResult =
  ApolloReactCommon.MutationResult<ArchiveTutorConversationMutation>;
export type ArchiveTutorConversationMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    ArchiveTutorConversationMutation,
    ArchiveTutorConversationMutationVariables
  >;
export const ReportTutorMessageDocument = gql`
  mutation ReportTutorMessage(
    $conversationId: ID!
    $messageId: ID!
    $note: String
  ) {
    reportTutorMessage(
      conversationId: $conversationId
      messageId: $messageId
      note: $note
    ) {
      ...TutorMessageFields
    }
  }
  ${TutorMessageFieldsFragmentDoc}
`;
export type ReportTutorMessageMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ReportTutorMessageMutation,
    ReportTutorMessageMutationVariables
  >,
) => Promise<any>;

/**
 * __useReportTutorMessageMutation__
 *
 * To run a mutation, you first call `useReportTutorMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReportTutorMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reportTutorMessageMutation, { data, loading, error }] = useReportTutorMessageMutation({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *      messageId: // value for 'messageId'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useReportTutorMessageMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ReportTutorMessageMutation,
    ReportTutorMessageMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ReportTutorMessageMutation,
    ReportTutorMessageMutationVariables
  >(ReportTutorMessageDocument, options);
}
export type ReportTutorMessageMutationHookResult = ReturnType<
  typeof useReportTutorMessageMutation
>;
export type ReportTutorMessageMutationResult =
  ApolloReactCommon.MutationResult<ReportTutorMessageMutation>;
export type ReportTutorMessageMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    ReportTutorMessageMutation,
    ReportTutorMessageMutationVariables
  >;
export const AdminContentDocument = gql`
  query AdminContent(
    $kind: ContentKind!
    $status: ContentStatus
    $title: String
    $page: Int
    $size: Int
  ) {
    adminContent(
      kind: $kind
      status: $status
      title: $title
      page: $page
      size: $size
    ) {
      items {
        ...ContentReviewFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;

/**
 * __useAdminContentQuery__
 *
 * To run a query within a React component, call `useAdminContentQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminContentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminContentQuery({
 *   variables: {
 *      kind: // value for 'kind'
 *      status: // value for 'status'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useAdminContentQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    AdminContentQuery,
    AdminContentQueryVariables
  > &
    (
      | { variables: AdminContentQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    AdminContentQuery,
    AdminContentQueryVariables
  >(AdminContentDocument, options);
}
export function useAdminContentLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    AdminContentQuery,
    AdminContentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    AdminContentQuery,
    AdminContentQueryVariables
  >(AdminContentDocument, options);
}
export function useAdminContentSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    AdminContentQuery,
    AdminContentQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AdminContentQuery,
  AdminContentQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useAdminContentSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AdminContentQuery,
        AdminContentQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AdminContentQuery | undefined,
  AdminContentQueryVariables
>;
export function useAdminContentSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AdminContentQuery,
        AdminContentQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    AdminContentQuery,
    AdminContentQueryVariables
  >(AdminContentDocument, options as any);
}
export type AdminContentQueryHookResult = ReturnType<
  typeof useAdminContentQuery
>;
export type AdminContentLazyQueryHookResult = ReturnType<
  typeof useAdminContentLazyQuery
>;
export type AdminContentSuspenseQueryHookResult = ReturnType<
  typeof useAdminContentSuspenseQuery
>;
export type AdminContentQueryResult = ApolloReactCommon.QueryResult<
  AdminContentQuery,
  AdminContentQueryVariables
>;
export const SubmitContentForReviewDocument = gql`
  mutation SubmitContentForReview($kind: ContentKind!, $id: ID!) {
    submitContentForReview(kind: $kind, id: $id) {
      ...ContentReviewFields
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;
export type SubmitContentForReviewMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitContentForReviewMutation,
    SubmitContentForReviewMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitContentForReviewMutation__
 *
 * To run a mutation, you first call `useSubmitContentForReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitContentForReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitContentForReviewMutation, { data, loading, error }] = useSubmitContentForReviewMutation({
 *   variables: {
 *      kind: // value for 'kind'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSubmitContentForReviewMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitContentForReviewMutation,
    SubmitContentForReviewMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitContentForReviewMutation,
    SubmitContentForReviewMutationVariables
  >(SubmitContentForReviewDocument, options);
}
export type SubmitContentForReviewMutationHookResult = ReturnType<
  typeof useSubmitContentForReviewMutation
>;
export type SubmitContentForReviewMutationResult =
  ApolloReactCommon.MutationResult<SubmitContentForReviewMutation>;
export type SubmitContentForReviewMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitContentForReviewMutation,
    SubmitContentForReviewMutationVariables
  >;
export const ApproveContentDocument = gql`
  mutation ApproveContent($kind: ContentKind!, $id: ID!) {
    approveContent(kind: $kind, id: $id) {
      ...ContentReviewFields
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;
export type ApproveContentMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ApproveContentMutation,
    ApproveContentMutationVariables
  >,
) => Promise<any>;

/**
 * __useApproveContentMutation__
 *
 * To run a mutation, you first call `useApproveContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveContentMutation, { data, loading, error }] = useApproveContentMutation({
 *   variables: {
 *      kind: // value for 'kind'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApproveContentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ApproveContentMutation,
    ApproveContentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ApproveContentMutation,
    ApproveContentMutationVariables
  >(ApproveContentDocument, options);
}
export type ApproveContentMutationHookResult = ReturnType<
  typeof useApproveContentMutation
>;
export type ApproveContentMutationResult =
  ApolloReactCommon.MutationResult<ApproveContentMutation>;
export type ApproveContentMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    ApproveContentMutation,
    ApproveContentMutationVariables
  >;
export const RejectContentDocument = gql`
  mutation RejectContent($kind: ContentKind!, $id: ID!, $note: String!) {
    rejectContent(kind: $kind, id: $id, note: $note) {
      ...ContentReviewFields
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;
export type RejectContentMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    RejectContentMutation,
    RejectContentMutationVariables
  >,
) => Promise<any>;

/**
 * __useRejectContentMutation__
 *
 * To run a mutation, you first call `useRejectContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectContentMutation, { data, loading, error }] = useRejectContentMutation({
 *   variables: {
 *      kind: // value for 'kind'
 *      id: // value for 'id'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useRejectContentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    RejectContentMutation,
    RejectContentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    RejectContentMutation,
    RejectContentMutationVariables
  >(RejectContentDocument, options);
}
export type RejectContentMutationHookResult = ReturnType<
  typeof useRejectContentMutation
>;
export type RejectContentMutationResult =
  ApolloReactCommon.MutationResult<RejectContentMutation>;
export type RejectContentMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    RejectContentMutation,
    RejectContentMutationVariables
  >;
export const PublishContentDocument = gql`
  mutation PublishContent($kind: ContentKind!, $id: ID!) {
    publishContent(kind: $kind, id: $id) {
      ...ContentReviewFields
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;
export type PublishContentMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    PublishContentMutation,
    PublishContentMutationVariables
  >,
) => Promise<any>;

/**
 * __usePublishContentMutation__
 *
 * To run a mutation, you first call `usePublishContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishContentMutation, { data, loading, error }] = usePublishContentMutation({
 *   variables: {
 *      kind: // value for 'kind'
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePublishContentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    PublishContentMutation,
    PublishContentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    PublishContentMutation,
    PublishContentMutationVariables
  >(PublishContentDocument, options);
}
export type PublishContentMutationHookResult = ReturnType<
  typeof usePublishContentMutation
>;
export type PublishContentMutationResult =
  ApolloReactCommon.MutationResult<PublishContentMutation>;
export type PublishContentMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    PublishContentMutation,
    PublishContentMutationVariables
  >;
export const ArchiveContentDocument = gql`
  mutation ArchiveContent($kind: ContentKind!, $id: ID!) {
    archiveContent(kind: $kind, id: $id) {
      ...ContentReviewFields
    }
  }
  ${ContentReviewFieldsFragmentDoc}
`;
export type ArchiveContentMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ArchiveContentMutation,
    ArchiveContentMutationVariables
  >,
) => Promise<any>;

/**
 * __useArchiveContentMutation__
 *
 * To run a mutation, you first call `useArchiveContentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveContentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveContentMutation, { data, loading, error }] = useArchiveContentMutation({
 *   variables: {
 *      kind: // value for 'kind'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveContentMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ArchiveContentMutation,
    ArchiveContentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ArchiveContentMutation,
    ArchiveContentMutationVariables
  >(ArchiveContentDocument, options);
}
export type ArchiveContentMutationHookResult = ReturnType<
  typeof useArchiveContentMutation
>;
export type ArchiveContentMutationResult =
  ApolloReactCommon.MutationResult<ArchiveContentMutation>;
export type ArchiveContentMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    ArchiveContentMutation,
    ArchiveContentMutationVariables
  >;
export const DictationLessonsDocument = gql`
  query DictationLessons(
    $topic: String
    $title: String
    $page: Int
    $size: Int
  ) {
    dictationLessons(topic: $topic, title: $title, page: $page, size: $size) {
      items {
        ...DictationLessonFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${DictationLessonFieldsFragmentDoc}
`;

/**
 * __useDictationLessonsQuery__
 *
 * To run a query within a React component, call `useDictationLessonsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDictationLessonsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDictationLessonsQuery({
 *   variables: {
 *      topic: // value for 'topic'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useDictationLessonsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >(DictationLessonsDocument, options);
}
export function useDictationLessonsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >(DictationLessonsDocument, options);
}
export function useDictationLessonsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationLessonsQuery,
  DictationLessonsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useDictationLessonsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationLessonsQuery,
        DictationLessonsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationLessonsQuery | undefined,
  DictationLessonsQueryVariables
>;
export function useDictationLessonsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationLessonsQuery,
        DictationLessonsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    DictationLessonsQuery,
    DictationLessonsQueryVariables
  >(DictationLessonsDocument, options as any);
}
export type DictationLessonsQueryHookResult = ReturnType<
  typeof useDictationLessonsQuery
>;
export type DictationLessonsLazyQueryHookResult = ReturnType<
  typeof useDictationLessonsLazyQuery
>;
export type DictationLessonsSuspenseQueryHookResult = ReturnType<
  typeof useDictationLessonsSuspenseQuery
>;
export type DictationLessonsQueryResult = ApolloReactCommon.QueryResult<
  DictationLessonsQuery,
  DictationLessonsQueryVariables
>;
export const DictationLessonDetailDocument = gql`
  query DictationLessonDetail($id: ID!) {
    dictationLesson(id: $id) {
      lesson {
        ...DictationLessonFields
      }
      sentences {
        ...DictationSentenceFields
      }
    }
  }
  ${DictationLessonFieldsFragmentDoc}
  ${DictationSentenceFieldsFragmentDoc}
`;

/**
 * __useDictationLessonDetailQuery__
 *
 * To run a query within a React component, call `useDictationLessonDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useDictationLessonDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDictationLessonDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDictationLessonDetailQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  > &
    (
      | { variables: DictationLessonDetailQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  >(DictationLessonDetailDocument, options);
}
export function useDictationLessonDetailLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  >(DictationLessonDetailDocument, options);
}
export function useDictationLessonDetailSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationLessonDetailQuery,
  DictationLessonDetailQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useDictationLessonDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationLessonDetailQuery,
        DictationLessonDetailQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationLessonDetailQuery | undefined,
  DictationLessonDetailQueryVariables
>;
export function useDictationLessonDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationLessonDetailQuery,
        DictationLessonDetailQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    DictationLessonDetailQuery,
    DictationLessonDetailQueryVariables
  >(DictationLessonDetailDocument, options as any);
}
export type DictationLessonDetailQueryHookResult = ReturnType<
  typeof useDictationLessonDetailQuery
>;
export type DictationLessonDetailLazyQueryHookResult = ReturnType<
  typeof useDictationLessonDetailLazyQuery
>;
export type DictationLessonDetailSuspenseQueryHookResult = ReturnType<
  typeof useDictationLessonDetailSuspenseQuery
>;
export type DictationLessonDetailQueryResult = ApolloReactCommon.QueryResult<
  DictationLessonDetailQuery,
  DictationLessonDetailQueryVariables
>;
export const SubmitDictationDocument = gql`
  mutation SubmitDictation($sentenceId: ID!, $response: String!) {
    submitDictation(sentenceId: $sentenceId, response: $response) {
      sentenceId
      correctText
      translationVi
      response
      accuracyPercent
      correctWordCount
      totalWordCount
    }
  }
`;
export type SubmitDictationMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitDictationMutation,
    SubmitDictationMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitDictationMutation__
 *
 * To run a mutation, you first call `useSubmitDictationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitDictationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitDictationMutation, { data, loading, error }] = useSubmitDictationMutation({
 *   variables: {
 *      sentenceId: // value for 'sentenceId'
 *      response: // value for 'response'
 *   },
 * });
 */
export function useSubmitDictationMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitDictationMutation,
    SubmitDictationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitDictationMutation,
    SubmitDictationMutationVariables
  >(SubmitDictationDocument, options);
}
export type SubmitDictationMutationHookResult = ReturnType<
  typeof useSubmitDictationMutation
>;
export type SubmitDictationMutationResult =
  ApolloReactCommon.MutationResult<SubmitDictationMutation>;
export type SubmitDictationMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitDictationMutation,
    SubmitDictationMutationVariables
  >;
export const DictationStatsDocument = gql`
  query DictationStats($periodDays: Int) {
    dictationStats(periodDays: $periodDays) {
      periodDays
      lessonsCompleted
      averageAccuracyPercent
      listeningSeconds
      sentencesPractised
      streakDays
      activity {
        day
        accuracyPercent
        attemptCount
      }
      missedWords {
        word
        missedCount
        correctCount
        accuracyPercent
      }
      difficultSentences {
        sentenceId
        text
        topic
        accuracyPercent
        attemptCount
      }
      history {
        day
        lessonId
        lessonTitle
        sentenceCount
        accuracyPercent
        listeningSeconds
      }
    }
  }
`;

/**
 * __useDictationStatsQuery__
 *
 * To run a query within a React component, call `useDictationStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDictationStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDictationStatsQuery({
 *   variables: {
 *      periodDays: // value for 'periodDays'
 *   },
 * });
 */
export function useDictationStatsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >(DictationStatsDocument, options);
}
export function useDictationStatsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >(DictationStatsDocument, options);
}
export function useDictationStatsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationStatsQuery,
  DictationStatsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useDictationStatsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationStatsQuery,
        DictationStatsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationStatsQuery | undefined,
  DictationStatsQueryVariables
>;
export function useDictationStatsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationStatsQuery,
        DictationStatsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    DictationStatsQuery,
    DictationStatsQueryVariables
  >(DictationStatsDocument, options as any);
}
export type DictationStatsQueryHookResult = ReturnType<
  typeof useDictationStatsQuery
>;
export type DictationStatsLazyQueryHookResult = ReturnType<
  typeof useDictationStatsLazyQuery
>;
export type DictationStatsSuspenseQueryHookResult = ReturnType<
  typeof useDictationStatsSuspenseQuery
>;
export type DictationStatsQueryResult = ApolloReactCommon.QueryResult<
  DictationStatsQuery,
  DictationStatsQueryVariables
>;
export const DictationMistakesDocument = gql`
  query DictationMistakes {
    dictationMistakes {
      sentenceId
      text
      audioUrl
      audioDurationSeconds
      lessonId
      lessonTitle
      bestAccuracyPercent
      attemptCount
      lastResponse
    }
  }
`;

/**
 * __useDictationMistakesQuery__
 *
 * To run a query within a React component, call `useDictationMistakesQuery` and pass it any options that fit your needs.
 * When your component renders, `useDictationMistakesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDictationMistakesQuery({
 *   variables: {
 *   },
 * });
 */
export function useDictationMistakesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >(DictationMistakesDocument, options);
}
export function useDictationMistakesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >(DictationMistakesDocument, options);
}
export function useDictationMistakesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationMistakesQuery,
  DictationMistakesQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useDictationMistakesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationMistakesQuery,
        DictationMistakesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DictationMistakesQuery | undefined,
  DictationMistakesQueryVariables
>;
export function useDictationMistakesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DictationMistakesQuery,
        DictationMistakesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    DictationMistakesQuery,
    DictationMistakesQueryVariables
  >(DictationMistakesDocument, options as any);
}
export type DictationMistakesQueryHookResult = ReturnType<
  typeof useDictationMistakesQuery
>;
export type DictationMistakesLazyQueryHookResult = ReturnType<
  typeof useDictationMistakesLazyQuery
>;
export type DictationMistakesSuspenseQueryHookResult = ReturnType<
  typeof useDictationMistakesSuspenseQuery
>;
export type DictationMistakesQueryResult = ApolloReactCommon.QueryResult<
  DictationMistakesQuery,
  DictationMistakesQueryVariables
>;
export const AdminExamsDocument = gql`
  query AdminExams(
    $status: ExamStatus
    $examType: ExamType
    $title: String
    $page: Int
    $size: Int
  ) {
    adminExams(
      status: $status
      examType: $examType
      title: $title
      page: $page
      size: $size
    ) {
      items {
        ...AdminExamFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${AdminExamFieldsFragmentDoc}
`;

/**
 * __useAdminExamsQuery__
 *
 * To run a query within a React component, call `useAdminExamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminExamsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminExamsQuery({
 *   variables: {
 *      status: // value for 'status'
 *      examType: // value for 'examType'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useAdminExamsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    AdminExamsQuery,
    AdminExamsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<AdminExamsQuery, AdminExamsQueryVariables>(
    AdminExamsDocument,
    options,
  );
}
export function useAdminExamsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    AdminExamsQuery,
    AdminExamsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    AdminExamsQuery,
    AdminExamsQueryVariables
  >(AdminExamsDocument, options);
}
export function useAdminExamsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    AdminExamsQuery,
    AdminExamsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AdminExamsQuery,
  AdminExamsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useAdminExamsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AdminExamsQuery,
        AdminExamsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AdminExamsQuery | undefined,
  AdminExamsQueryVariables
>;
export function useAdminExamsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AdminExamsQuery,
        AdminExamsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    AdminExamsQuery,
    AdminExamsQueryVariables
  >(AdminExamsDocument, options as any);
}
export type AdminExamsQueryHookResult = ReturnType<typeof useAdminExamsQuery>;
export type AdminExamsLazyQueryHookResult = ReturnType<
  typeof useAdminExamsLazyQuery
>;
export type AdminExamsSuspenseQueryHookResult = ReturnType<
  typeof useAdminExamsSuspenseQuery
>;
export type AdminExamsQueryResult = ApolloReactCommon.QueryResult<
  AdminExamsQuery,
  AdminExamsQueryVariables
>;
export const PublishExamDocument = gql`
  mutation PublishExam($id: ID!) {
    publishExam(id: $id) {
      ...AdminExamShellFields
    }
  }
  ${AdminExamShellFieldsFragmentDoc}
`;
export type PublishExamMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    PublishExamMutation,
    PublishExamMutationVariables
  >,
) => Promise<any>;

/**
 * __usePublishExamMutation__
 *
 * To run a mutation, you first call `usePublishExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishExamMutation, { data, loading, error }] = usePublishExamMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePublishExamMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    PublishExamMutation,
    PublishExamMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    PublishExamMutation,
    PublishExamMutationVariables
  >(PublishExamDocument, options);
}
export type PublishExamMutationHookResult = ReturnType<
  typeof usePublishExamMutation
>;
export type PublishExamMutationResult =
  ApolloReactCommon.MutationResult<PublishExamMutation>;
export type PublishExamMutationOptions = ApolloReactCommon.MutationHookOptions<
  PublishExamMutation,
  PublishExamMutationVariables
>;
export const ArchiveExamDocument = gql`
  mutation ArchiveExam($id: ID!) {
    archiveExam(id: $id) {
      ...AdminExamShellFields
    }
  }
  ${AdminExamShellFieldsFragmentDoc}
`;
export type ArchiveExamMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ArchiveExamMutation,
    ArchiveExamMutationVariables
  >,
) => Promise<any>;

/**
 * __useArchiveExamMutation__
 *
 * To run a mutation, you first call `useArchiveExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveExamMutation, { data, loading, error }] = useArchiveExamMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useArchiveExamMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ArchiveExamMutation,
    ArchiveExamMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ArchiveExamMutation,
    ArchiveExamMutationVariables
  >(ArchiveExamDocument, options);
}
export type ArchiveExamMutationHookResult = ReturnType<
  typeof useArchiveExamMutation
>;
export type ArchiveExamMutationResult =
  ApolloReactCommon.MutationResult<ArchiveExamMutation>;
export type ArchiveExamMutationOptions = ApolloReactCommon.MutationHookOptions<
  ArchiveExamMutation,
  ArchiveExamMutationVariables
>;
export const SubmitExamForReviewDocument = gql`
  mutation SubmitExamForReview($id: ID!) {
    submitExamForReview(id: $id) {
      ...AdminExamShellFields
    }
  }
  ${AdminExamShellFieldsFragmentDoc}
`;
export type SubmitExamForReviewMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitExamForReviewMutation,
    SubmitExamForReviewMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitExamForReviewMutation__
 *
 * To run a mutation, you first call `useSubmitExamForReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitExamForReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitExamForReviewMutation, { data, loading, error }] = useSubmitExamForReviewMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSubmitExamForReviewMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitExamForReviewMutation,
    SubmitExamForReviewMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitExamForReviewMutation,
    SubmitExamForReviewMutationVariables
  >(SubmitExamForReviewDocument, options);
}
export type SubmitExamForReviewMutationHookResult = ReturnType<
  typeof useSubmitExamForReviewMutation
>;
export type SubmitExamForReviewMutationResult =
  ApolloReactCommon.MutationResult<SubmitExamForReviewMutation>;
export type SubmitExamForReviewMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitExamForReviewMutation,
    SubmitExamForReviewMutationVariables
  >;
export const ApproveExamDocument = gql`
  mutation ApproveExam($id: ID!) {
    approveExam(id: $id) {
      ...AdminExamShellFields
    }
  }
  ${AdminExamShellFieldsFragmentDoc}
`;
export type ApproveExamMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    ApproveExamMutation,
    ApproveExamMutationVariables
  >,
) => Promise<any>;

/**
 * __useApproveExamMutation__
 *
 * To run a mutation, you first call `useApproveExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveExamMutation, { data, loading, error }] = useApproveExamMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApproveExamMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    ApproveExamMutation,
    ApproveExamMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    ApproveExamMutation,
    ApproveExamMutationVariables
  >(ApproveExamDocument, options);
}
export type ApproveExamMutationHookResult = ReturnType<
  typeof useApproveExamMutation
>;
export type ApproveExamMutationResult =
  ApolloReactCommon.MutationResult<ApproveExamMutation>;
export type ApproveExamMutationOptions = ApolloReactCommon.MutationHookOptions<
  ApproveExamMutation,
  ApproveExamMutationVariables
>;
export const RejectExamDocument = gql`
  mutation RejectExam($id: ID!, $note: String!) {
    rejectExam(id: $id, note: $note) {
      ...AdminExamShellFields
    }
  }
  ${AdminExamShellFieldsFragmentDoc}
`;
export type RejectExamMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    RejectExamMutation,
    RejectExamMutationVariables
  >,
) => Promise<any>;

/**
 * __useRejectExamMutation__
 *
 * To run a mutation, you first call `useRejectExamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectExamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectExamMutation, { data, loading, error }] = useRejectExamMutation({
 *   variables: {
 *      id: // value for 'id'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useRejectExamMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    RejectExamMutation,
    RejectExamMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    RejectExamMutation,
    RejectExamMutationVariables
  >(RejectExamDocument, options);
}
export type RejectExamMutationHookResult = ReturnType<
  typeof useRejectExamMutation
>;
export type RejectExamMutationResult =
  ApolloReactCommon.MutationResult<RejectExamMutation>;
export type RejectExamMutationOptions = ApolloReactCommon.MutationHookOptions<
  RejectExamMutation,
  RejectExamMutationVariables
>;
export const StartExamAttemptDocument = gql`
  mutation StartExamAttempt($examId: ID!) {
    startExamAttempt(examId: $examId) {
      ...ExamAttemptFields
    }
  }
  ${ExamAttemptFieldsFragmentDoc}
`;
export type StartExamAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    StartExamAttemptMutation,
    StartExamAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useStartExamAttemptMutation__
 *
 * To run a mutation, you first call `useStartExamAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartExamAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startExamAttemptMutation, { data, loading, error }] = useStartExamAttemptMutation({
 *   variables: {
 *      examId: // value for 'examId'
 *   },
 * });
 */
export function useStartExamAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    StartExamAttemptMutation,
    StartExamAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    StartExamAttemptMutation,
    StartExamAttemptMutationVariables
  >(StartExamAttemptDocument, options);
}
export type StartExamAttemptMutationHookResult = ReturnType<
  typeof useStartExamAttemptMutation
>;
export type StartExamAttemptMutationResult =
  ApolloReactCommon.MutationResult<StartExamAttemptMutation>;
export type StartExamAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    StartExamAttemptMutation,
    StartExamAttemptMutationVariables
  >;
export const AttemptPaperDocument = gql`
  query AttemptPaper($attemptId: ID!) {
    attemptPaper(attemptId: $attemptId) {
      id
      title
      description
      examType
      certificateType
      certificateVariant
      targetLevel
      durationSeconds
      maxRawScore
      passScore
      versionNumber
      sections {
        id
        sectionType
        orderNo
        maxRawScore
        scoredByCriteria
        timeLimitSeconds
        parts {
          id
          orderNo
          title
          instruction
          content
          audioUrl
          imageUrl
          questionSets {
            id
            title
            instruction
            orderNo
            content
            audioUrl
            imageUrl
            questions {
              id
              questionType
              content
              difficultyLevel
              skillType
              questionCategory
              orderNo
              maxRawScore
              options {
                id
                content
                orderNo
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * __useAttemptPaperQuery__
 *
 * To run a query within a React component, call `useAttemptPaperQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttemptPaperQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttemptPaperQuery({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *   },
 * });
 */
export function useAttemptPaperQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  > &
    (
      | { variables: AttemptPaperQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  >(AttemptPaperDocument, options);
}
export function useAttemptPaperLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  >(AttemptPaperDocument, options);
}
export function useAttemptPaperSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AttemptPaperQuery,
  AttemptPaperQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useAttemptPaperSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AttemptPaperQuery,
        AttemptPaperQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  AttemptPaperQuery | undefined,
  AttemptPaperQueryVariables
>;
export function useAttemptPaperSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        AttemptPaperQuery,
        AttemptPaperQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    AttemptPaperQuery,
    AttemptPaperQueryVariables
  >(AttemptPaperDocument, options as any);
}
export type AttemptPaperQueryHookResult = ReturnType<
  typeof useAttemptPaperQuery
>;
export type AttemptPaperLazyQueryHookResult = ReturnType<
  typeof useAttemptPaperLazyQuery
>;
export type AttemptPaperSuspenseQueryHookResult = ReturnType<
  typeof useAttemptPaperSuspenseQuery
>;
export type AttemptPaperQueryResult = ApolloReactCommon.QueryResult<
  AttemptPaperQuery,
  AttemptPaperQueryVariables
>;
export const SubmitExamAttemptDocument = gql`
  mutation SubmitExamAttempt($attemptId: ID!, $answers: [SubmitAnswerInput!]!) {
    submitExamAttempt(attemptId: $attemptId, answers: $answers) {
      ...ExamAttemptFields
      questions {
        ...AttemptReviewFields
      }
    }
  }
  ${ExamAttemptFieldsFragmentDoc}
  ${AttemptReviewFieldsFragmentDoc}
`;
export type SubmitExamAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitExamAttemptMutation,
    SubmitExamAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitExamAttemptMutation__
 *
 * To run a mutation, you first call `useSubmitExamAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitExamAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitExamAttemptMutation, { data, loading, error }] = useSubmitExamAttemptMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *      answers: // value for 'answers'
 *   },
 * });
 */
export function useSubmitExamAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitExamAttemptMutation,
    SubmitExamAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitExamAttemptMutation,
    SubmitExamAttemptMutationVariables
  >(SubmitExamAttemptDocument, options);
}
export type SubmitExamAttemptMutationHookResult = ReturnType<
  typeof useSubmitExamAttemptMutation
>;
export type SubmitExamAttemptMutationResult =
  ApolloReactCommon.MutationResult<SubmitExamAttemptMutation>;
export type SubmitExamAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitExamAttemptMutation,
    SubmitExamAttemptMutationVariables
  >;
export const ExamAttemptResultDocument = gql`
  query ExamAttemptResult($id: ID!) {
    examAttempt(id: $id) {
      ...ExamAttemptFields
      questions {
        ...AttemptReviewFields
      }
    }
  }
  ${ExamAttemptFieldsFragmentDoc}
  ${AttemptReviewFieldsFragmentDoc}
`;

/**
 * __useExamAttemptResultQuery__
 *
 * To run a query within a React component, call `useExamAttemptResultQuery` and pass it any options that fit your needs.
 * When your component renders, `useExamAttemptResultQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExamAttemptResultQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExamAttemptResultQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  > &
    (
      | { variables: ExamAttemptResultQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  >(ExamAttemptResultDocument, options);
}
export function useExamAttemptResultLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  >(ExamAttemptResultDocument, options);
}
export function useExamAttemptResultSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamAttemptResultQuery,
  ExamAttemptResultQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamAttemptResultSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamAttemptResultQuery,
        ExamAttemptResultQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamAttemptResultQuery | undefined,
  ExamAttemptResultQueryVariables
>;
export function useExamAttemptResultSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamAttemptResultQuery,
        ExamAttemptResultQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    ExamAttemptResultQuery,
    ExamAttemptResultQueryVariables
  >(ExamAttemptResultDocument, options as any);
}
export type ExamAttemptResultQueryHookResult = ReturnType<
  typeof useExamAttemptResultQuery
>;
export type ExamAttemptResultLazyQueryHookResult = ReturnType<
  typeof useExamAttemptResultLazyQuery
>;
export type ExamAttemptResultSuspenseQueryHookResult = ReturnType<
  typeof useExamAttemptResultSuspenseQuery
>;
export type ExamAttemptResultQueryResult = ApolloReactCommon.QueryResult<
  ExamAttemptResultQuery,
  ExamAttemptResultQueryVariables
>;
export const ExamAttemptHistoryDocument = gql`
  query ExamAttemptHistory($page: Int, $size: Int) {
    examAttempts(page: $page, size: $size) {
      items {
        ...ExamAttemptFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${ExamAttemptFieldsFragmentDoc}
`;

/**
 * __useExamAttemptHistoryQuery__
 *
 * To run a query within a React component, call `useExamAttemptHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useExamAttemptHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExamAttemptHistoryQuery({
 *   variables: {
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useExamAttemptHistoryQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >(ExamAttemptHistoryDocument, options);
}
export function useExamAttemptHistoryLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >(ExamAttemptHistoryDocument, options);
}
export function useExamAttemptHistorySuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamAttemptHistoryQuery,
  ExamAttemptHistoryQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamAttemptHistorySuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamAttemptHistoryQuery,
        ExamAttemptHistoryQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamAttemptHistoryQuery | undefined,
  ExamAttemptHistoryQueryVariables
>;
export function useExamAttemptHistorySuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamAttemptHistoryQuery,
        ExamAttemptHistoryQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    ExamAttemptHistoryQuery,
    ExamAttemptHistoryQueryVariables
  >(ExamAttemptHistoryDocument, options as any);
}
export type ExamAttemptHistoryQueryHookResult = ReturnType<
  typeof useExamAttemptHistoryQuery
>;
export type ExamAttemptHistoryLazyQueryHookResult = ReturnType<
  typeof useExamAttemptHistoryLazyQuery
>;
export type ExamAttemptHistorySuspenseQueryHookResult = ReturnType<
  typeof useExamAttemptHistorySuspenseQuery
>;
export type ExamAttemptHistoryQueryResult = ApolloReactCommon.QueryResult<
  ExamAttemptHistoryQuery,
  ExamAttemptHistoryQueryVariables
>;
export const ExamLibraryDocument = gql`
  query ExamLibrary(
    $examType: ExamType
    $certificateType: CertificateType
    $certificateVariant: CertificateVariant
    $targetLevel: TargetLevel
    $title: String
    $page: Int
    $size: Int
  ) {
    exams(
      examType: $examType
      certificateType: $certificateType
      certificateVariant: $certificateVariant
      targetLevel: $targetLevel
      title: $title
      page: $page
      size: $size
    ) {
      items {
        id
        title
        description
        examType
        certificateType
        certificateVariant
        targetLevel
        durationSeconds
        maxRawScore
        passScore
        questionCount
        status
        publishedAt
        bestScorePercentage
        attemptStatus
      }
      page
      size
      totalItems
      totalPages
    }
  }
`;

/**
 * __useExamLibraryQuery__
 *
 * To run a query within a React component, call `useExamLibraryQuery` and pass it any options that fit your needs.
 * When your component renders, `useExamLibraryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExamLibraryQuery({
 *   variables: {
 *      examType: // value for 'examType'
 *      certificateType: // value for 'certificateType'
 *      certificateVariant: // value for 'certificateVariant'
 *      targetLevel: // value for 'targetLevel'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useExamLibraryQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    ExamLibraryQuery,
    ExamLibraryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ExamLibraryQuery, ExamLibraryQueryVariables>(
    ExamLibraryDocument,
    options,
  );
}
export function useExamLibraryLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ExamLibraryQuery,
    ExamLibraryQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ExamLibraryQuery,
    ExamLibraryQueryVariables
  >(ExamLibraryDocument, options);
}
export function useExamLibrarySuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ExamLibraryQuery,
    ExamLibraryQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamLibraryQuery,
  ExamLibraryQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamLibrarySuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamLibraryQuery,
        ExamLibraryQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamLibraryQuery | undefined,
  ExamLibraryQueryVariables
>;
export function useExamLibrarySuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamLibraryQuery,
        ExamLibraryQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    ExamLibraryQuery,
    ExamLibraryQueryVariables
  >(ExamLibraryDocument, options as any);
}
export type ExamLibraryQueryHookResult = ReturnType<typeof useExamLibraryQuery>;
export type ExamLibraryLazyQueryHookResult = ReturnType<
  typeof useExamLibraryLazyQuery
>;
export type ExamLibrarySuspenseQueryHookResult = ReturnType<
  typeof useExamLibrarySuspenseQuery
>;
export type ExamLibraryQueryResult = ApolloReactCommon.QueryResult<
  ExamLibraryQuery,
  ExamLibraryQueryVariables
>;
export const ExamDetailDocument = gql`
  query ExamDetail($id: ID!) {
    exam(id: $id) {
      id
      title
      description
      examType
      certificateType
      certificateVariant
      targetLevel
      durationSeconds
      maxRawScore
      passScore
      questionCount
      status
      publishedAt
      bestScorePercentage
      attemptStatus
    }
  }
`;

/**
 * __useExamDetailQuery__
 *
 * To run a query within a React component, call `useExamDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useExamDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExamDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExamDetailQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    ExamDetailQuery,
    ExamDetailQueryVariables
  > &
    (
      | { variables: ExamDetailQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<ExamDetailQuery, ExamDetailQueryVariables>(
    ExamDetailDocument,
    options,
  );
}
export function useExamDetailLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    ExamDetailQuery,
    ExamDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    ExamDetailQuery,
    ExamDetailQueryVariables
  >(ExamDetailDocument, options);
}
export function useExamDetailSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    ExamDetailQuery,
    ExamDetailQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamDetailQuery,
  ExamDetailQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamDetailQuery,
        ExamDetailQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  ExamDetailQuery | undefined,
  ExamDetailQueryVariables
>;
export function useExamDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        ExamDetailQuery,
        ExamDetailQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    ExamDetailQuery,
    ExamDetailQueryVariables
  >(ExamDetailDocument, options as any);
}
export type ExamDetailQueryHookResult = ReturnType<typeof useExamDetailQuery>;
export type ExamDetailLazyQueryHookResult = ReturnType<
  typeof useExamDetailLazyQuery
>;
export type ExamDetailSuspenseQueryHookResult = ReturnType<
  typeof useExamDetailSuspenseQuery
>;
export type ExamDetailQueryResult = ApolloReactCommon.QueryResult<
  ExamDetailQuery,
  ExamDetailQueryVariables
>;
export const PlacementExamDocument = gql`
  query PlacementExam {
    placementExam {
      id
      title
      description
      durationSeconds
      questionCount
    }
  }
`;

/**
 * __usePlacementExamQuery__
 *
 * To run a query within a React component, call `usePlacementExamQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlacementExamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlacementExamQuery({
 *   variables: {
 *   },
 * });
 */
export function usePlacementExamQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >(PlacementExamDocument, options);
}
export function usePlacementExamLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >(PlacementExamDocument, options);
}
export function usePlacementExamSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  PlacementExamQuery,
  PlacementExamQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function usePlacementExamSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        PlacementExamQuery,
        PlacementExamQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  PlacementExamQuery | undefined,
  PlacementExamQueryVariables
>;
export function usePlacementExamSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        PlacementExamQuery,
        PlacementExamQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    PlacementExamQuery,
    PlacementExamQueryVariables
  >(PlacementExamDocument, options as any);
}
export type PlacementExamQueryHookResult = ReturnType<
  typeof usePlacementExamQuery
>;
export type PlacementExamLazyQueryHookResult = ReturnType<
  typeof usePlacementExamLazyQuery
>;
export type PlacementExamSuspenseQueryHookResult = ReturnType<
  typeof usePlacementExamSuspenseQuery
>;
export type PlacementExamQueryResult = ApolloReactCommon.QueryResult<
  PlacementExamQuery,
  PlacementExamQueryVariables
>;
export const FlashcardSetsDocument = gql`
  query FlashcardSets($topic: String, $title: String, $page: Int, $size: Int) {
    flashcardSets(topic: $topic, title: $title, page: $page, size: $size) {
      items {
        ...FlashcardSetFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${FlashcardSetFieldsFragmentDoc}
`;

/**
 * __useFlashcardSetsQuery__
 *
 * To run a query within a React component, call `useFlashcardSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFlashcardSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFlashcardSetsQuery({
 *   variables: {
 *      topic: // value for 'topic'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useFlashcardSetsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >(FlashcardSetsDocument, options);
}
export function useFlashcardSetsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >(FlashcardSetsDocument, options);
}
export function useFlashcardSetsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardSetsQuery,
  FlashcardSetsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useFlashcardSetsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardSetsQuery,
        FlashcardSetsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardSetsQuery | undefined,
  FlashcardSetsQueryVariables
>;
export function useFlashcardSetsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardSetsQuery,
        FlashcardSetsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    FlashcardSetsQuery,
    FlashcardSetsQueryVariables
  >(FlashcardSetsDocument, options as any);
}
export type FlashcardSetsQueryHookResult = ReturnType<
  typeof useFlashcardSetsQuery
>;
export type FlashcardSetsLazyQueryHookResult = ReturnType<
  typeof useFlashcardSetsLazyQuery
>;
export type FlashcardSetsSuspenseQueryHookResult = ReturnType<
  typeof useFlashcardSetsSuspenseQuery
>;
export type FlashcardSetsQueryResult = ApolloReactCommon.QueryResult<
  FlashcardSetsQuery,
  FlashcardSetsQueryVariables
>;
export const FlashcardSetDetailDocument = gql`
  query FlashcardSetDetail($id: ID!) {
    flashcardSet(id: $id) {
      set {
        ...FlashcardSetFields
      }
      cards {
        ...FlashcardFields
      }
    }
  }
  ${FlashcardSetFieldsFragmentDoc}
  ${FlashcardFieldsFragmentDoc}
`;

/**
 * __useFlashcardSetDetailQuery__
 *
 * To run a query within a React component, call `useFlashcardSetDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useFlashcardSetDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFlashcardSetDetailQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFlashcardSetDetailQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  > &
    (
      | { variables: FlashcardSetDetailQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  >(FlashcardSetDetailDocument, options);
}
export function useFlashcardSetDetailLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  >(FlashcardSetDetailDocument, options);
}
export function useFlashcardSetDetailSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardSetDetailQuery,
  FlashcardSetDetailQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useFlashcardSetDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardSetDetailQuery,
        FlashcardSetDetailQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardSetDetailQuery | undefined,
  FlashcardSetDetailQueryVariables
>;
export function useFlashcardSetDetailSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardSetDetailQuery,
        FlashcardSetDetailQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    FlashcardSetDetailQuery,
    FlashcardSetDetailQueryVariables
  >(FlashcardSetDetailDocument, options as any);
}
export type FlashcardSetDetailQueryHookResult = ReturnType<
  typeof useFlashcardSetDetailQuery
>;
export type FlashcardSetDetailLazyQueryHookResult = ReturnType<
  typeof useFlashcardSetDetailLazyQuery
>;
export type FlashcardSetDetailSuspenseQueryHookResult = ReturnType<
  typeof useFlashcardSetDetailSuspenseQuery
>;
export type FlashcardSetDetailQueryResult = ApolloReactCommon.QueryResult<
  FlashcardSetDetailQuery,
  FlashcardSetDetailQueryVariables
>;
export const FlashcardStudyQueueDocument = gql`
  query FlashcardStudyQueue($setId: ID!, $limit: Int) {
    flashcardStudyQueue(setId: $setId, limit: $limit) {
      ...FlashcardFields
    }
  }
  ${FlashcardFieldsFragmentDoc}
`;

/**
 * __useFlashcardStudyQueueQuery__
 *
 * To run a query within a React component, call `useFlashcardStudyQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useFlashcardStudyQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFlashcardStudyQueueQuery({
 *   variables: {
 *      setId: // value for 'setId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFlashcardStudyQueueQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  > &
    (
      | { variables: FlashcardStudyQueueQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  >(FlashcardStudyQueueDocument, options);
}
export function useFlashcardStudyQueueLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  >(FlashcardStudyQueueDocument, options);
}
export function useFlashcardStudyQueueSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardStudyQueueQuery,
  FlashcardStudyQueueQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useFlashcardStudyQueueSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardStudyQueueQuery,
        FlashcardStudyQueueQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardStudyQueueQuery | undefined,
  FlashcardStudyQueueQueryVariables
>;
export function useFlashcardStudyQueueSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardStudyQueueQuery,
        FlashcardStudyQueueQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    FlashcardStudyQueueQuery,
    FlashcardStudyQueueQueryVariables
  >(FlashcardStudyQueueDocument, options as any);
}
export type FlashcardStudyQueueQueryHookResult = ReturnType<
  typeof useFlashcardStudyQueueQuery
>;
export type FlashcardStudyQueueLazyQueryHookResult = ReturnType<
  typeof useFlashcardStudyQueueLazyQuery
>;
export type FlashcardStudyQueueSuspenseQueryHookResult = ReturnType<
  typeof useFlashcardStudyQueueSuspenseQuery
>;
export type FlashcardStudyQueueQueryResult = ApolloReactCommon.QueryResult<
  FlashcardStudyQueueQuery,
  FlashcardStudyQueueQueryVariables
>;
export const RateFlashcardDocument = gql`
  mutation RateFlashcard(
    $flashcardId: ID!
    $rating: ReviewRating!
    $timeSpentSeconds: Int!
  ) {
    rateFlashcard(
      flashcardId: $flashcardId
      rating: $rating
      timeSpentSeconds: $timeSpentSeconds
    ) {
      flashcardId
      status
      repetitions
      intervalDays
      dueAt
      lapseCount
    }
  }
`;
export type RateFlashcardMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    RateFlashcardMutation,
    RateFlashcardMutationVariables
  >,
) => Promise<any>;

/**
 * __useRateFlashcardMutation__
 *
 * To run a mutation, you first call `useRateFlashcardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRateFlashcardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rateFlashcardMutation, { data, loading, error }] = useRateFlashcardMutation({
 *   variables: {
 *      flashcardId: // value for 'flashcardId'
 *      rating: // value for 'rating'
 *      timeSpentSeconds: // value for 'timeSpentSeconds'
 *   },
 * });
 */
export function useRateFlashcardMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    RateFlashcardMutation,
    RateFlashcardMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    RateFlashcardMutation,
    RateFlashcardMutationVariables
  >(RateFlashcardDocument, options);
}
export type RateFlashcardMutationHookResult = ReturnType<
  typeof useRateFlashcardMutation
>;
export type RateFlashcardMutationResult =
  ApolloReactCommon.MutationResult<RateFlashcardMutation>;
export type RateFlashcardMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    RateFlashcardMutation,
    RateFlashcardMutationVariables
  >;
export const FlashcardStatsDocument = gql`
  query FlashcardStats($periodDays: Int) {
    flashcardStats(periodDays: $periodDays) {
      periodDays
      cardsStudied
      retentionPercent
      studySeconds
      streakDays
      activity {
        day
        cardCount
      }
      difficultCards {
        flashcardId
        lemma
        setName
        lapseCount
        lastReviewed
      }
      history {
        day
        setId
        setName
        cardCount
        recallPercent
        studySeconds
      }
    }
  }
`;

/**
 * __useFlashcardStatsQuery__
 *
 * To run a query within a React component, call `useFlashcardStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFlashcardStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFlashcardStatsQuery({
 *   variables: {
 *      periodDays: // value for 'periodDays'
 *   },
 * });
 */
export function useFlashcardStatsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >(FlashcardStatsDocument, options);
}
export function useFlashcardStatsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >(FlashcardStatsDocument, options);
}
export function useFlashcardStatsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardStatsQuery,
  FlashcardStatsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useFlashcardStatsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardStatsQuery,
        FlashcardStatsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  FlashcardStatsQuery | undefined,
  FlashcardStatsQueryVariables
>;
export function useFlashcardStatsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        FlashcardStatsQuery,
        FlashcardStatsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    FlashcardStatsQuery,
    FlashcardStatsQueryVariables
  >(FlashcardStatsDocument, options as any);
}
export type FlashcardStatsQueryHookResult = ReturnType<
  typeof useFlashcardStatsQuery
>;
export type FlashcardStatsLazyQueryHookResult = ReturnType<
  typeof useFlashcardStatsLazyQuery
>;
export type FlashcardStatsSuspenseQueryHookResult = ReturnType<
  typeof useFlashcardStatsSuspenseQuery
>;
export type FlashcardStatsQueryResult = ApolloReactCommon.QueryResult<
  FlashcardStatsQuery,
  FlashcardStatsQueryVariables
>;
export const LearningPurposesDocument = gql`
  query LearningPurposes {
    learningPurposes {
      id
      purposeCode
      displayName
    }
  }
`;

/**
 * __useLearningPurposesQuery__
 *
 * To run a query within a React component, call `useLearningPurposesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLearningPurposesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLearningPurposesQuery({
 *   variables: {
 *   },
 * });
 */
export function useLearningPurposesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >(LearningPurposesDocument, options);
}
export function useLearningPurposesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >(LearningPurposesDocument, options);
}
export function useLearningPurposesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  LearningPurposesQuery,
  LearningPurposesQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useLearningPurposesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        LearningPurposesQuery,
        LearningPurposesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  LearningPurposesQuery | undefined,
  LearningPurposesQueryVariables
>;
export function useLearningPurposesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        LearningPurposesQuery,
        LearningPurposesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    LearningPurposesQuery,
    LearningPurposesQueryVariables
  >(LearningPurposesDocument, options as any);
}
export type LearningPurposesQueryHookResult = ReturnType<
  typeof useLearningPurposesQuery
>;
export type LearningPurposesLazyQueryHookResult = ReturnType<
  typeof useLearningPurposesLazyQuery
>;
export type LearningPurposesSuspenseQueryHookResult = ReturnType<
  typeof useLearningPurposesSuspenseQuery
>;
export type LearningPurposesQueryResult = ApolloReactCommon.QueryResult<
  LearningPurposesQuery,
  LearningPurposesQueryVariables
>;
export const SelectLearningPurposesDocument = gql`
  mutation SelectLearningPurposes($purposeIds: [Int!]!) {
    selectLearningPurposes(purposeIds: $purposeIds) {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type SelectLearningPurposesMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SelectLearningPurposesMutation,
    SelectLearningPurposesMutationVariables
  >,
) => Promise<any>;

/**
 * __useSelectLearningPurposesMutation__
 *
 * To run a mutation, you first call `useSelectLearningPurposesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSelectLearningPurposesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [selectLearningPurposesMutation, { data, loading, error }] = useSelectLearningPurposesMutation({
 *   variables: {
 *      purposeIds: // value for 'purposeIds'
 *   },
 * });
 */
export function useSelectLearningPurposesMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SelectLearningPurposesMutation,
    SelectLearningPurposesMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SelectLearningPurposesMutation,
    SelectLearningPurposesMutationVariables
  >(SelectLearningPurposesDocument, options);
}
export type SelectLearningPurposesMutationHookResult = ReturnType<
  typeof useSelectLearningPurposesMutation
>;
export type SelectLearningPurposesMutationResult =
  ApolloReactCommon.MutationResult<SelectLearningPurposesMutation>;
export type SelectLearningPurposesMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SelectLearningPurposesMutation,
    SelectLearningPurposesMutationVariables
  >;
export const SetCertificateTargetDocument = gql`
  mutation SetCertificateTarget($certificateType: TargetCertificate!) {
    setCertificateTarget(certificateType: $certificateType) {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type SetCertificateTargetMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SetCertificateTargetMutation,
    SetCertificateTargetMutationVariables
  >,
) => Promise<any>;

/**
 * __useSetCertificateTargetMutation__
 *
 * To run a mutation, you first call `useSetCertificateTargetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCertificateTargetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCertificateTargetMutation, { data, loading, error }] = useSetCertificateTargetMutation({
 *   variables: {
 *      certificateType: // value for 'certificateType'
 *   },
 * });
 */
export function useSetCertificateTargetMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SetCertificateTargetMutation,
    SetCertificateTargetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SetCertificateTargetMutation,
    SetCertificateTargetMutationVariables
  >(SetCertificateTargetDocument, options);
}
export type SetCertificateTargetMutationHookResult = ReturnType<
  typeof useSetCertificateTargetMutation
>;
export type SetCertificateTargetMutationResult =
  ApolloReactCommon.MutationResult<SetCertificateTargetMutation>;
export type SetCertificateTargetMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SetCertificateTargetMutation,
    SetCertificateTargetMutationVariables
  >;
export const SetCurrentLevelDocument = gql`
  mutation SetCurrentLevel($level: CefrLevel!) {
    setCurrentLevel(level: $level) {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type SetCurrentLevelMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SetCurrentLevelMutation,
    SetCurrentLevelMutationVariables
  >,
) => Promise<any>;

/**
 * __useSetCurrentLevelMutation__
 *
 * To run a mutation, you first call `useSetCurrentLevelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCurrentLevelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCurrentLevelMutation, { data, loading, error }] = useSetCurrentLevelMutation({
 *   variables: {
 *      level: // value for 'level'
 *   },
 * });
 */
export function useSetCurrentLevelMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SetCurrentLevelMutation,
    SetCurrentLevelMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SetCurrentLevelMutation,
    SetCurrentLevelMutationVariables
  >(SetCurrentLevelDocument, options);
}
export type SetCurrentLevelMutationHookResult = ReturnType<
  typeof useSetCurrentLevelMutation
>;
export type SetCurrentLevelMutationResult =
  ApolloReactCommon.MutationResult<SetCurrentLevelMutation>;
export type SetCurrentLevelMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SetCurrentLevelMutation,
    SetCurrentLevelMutationVariables
  >;
export const SetLearningGoalDocument = gql`
  mutation SetLearningGoal($input: LearningGoalInput!) {
    setLearningGoal(input: $input) {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type SetLearningGoalMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SetLearningGoalMutation,
    SetLearningGoalMutationVariables
  >,
) => Promise<any>;

/**
 * __useSetLearningGoalMutation__
 *
 * To run a mutation, you first call `useSetLearningGoalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetLearningGoalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setLearningGoalMutation, { data, loading, error }] = useSetLearningGoalMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetLearningGoalMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SetLearningGoalMutation,
    SetLearningGoalMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SetLearningGoalMutation,
    SetLearningGoalMutationVariables
  >(SetLearningGoalDocument, options);
}
export type SetLearningGoalMutationHookResult = ReturnType<
  typeof useSetLearningGoalMutation
>;
export type SetLearningGoalMutationResult =
  ApolloReactCommon.MutationResult<SetLearningGoalMutation>;
export type SetLearningGoalMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SetLearningGoalMutation,
    SetLearningGoalMutationVariables
  >;
export const SelectTargetSkillsDocument = gql`
  mutation SelectTargetSkills($skills: [LearningSkill!]!) {
    selectTargetSkills(skills: $skills) {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type SelectTargetSkillsMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SelectTargetSkillsMutation,
    SelectTargetSkillsMutationVariables
  >,
) => Promise<any>;

/**
 * __useSelectTargetSkillsMutation__
 *
 * To run a mutation, you first call `useSelectTargetSkillsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSelectTargetSkillsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [selectTargetSkillsMutation, { data, loading, error }] = useSelectTargetSkillsMutation({
 *   variables: {
 *      skills: // value for 'skills'
 *   },
 * });
 */
export function useSelectTargetSkillsMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SelectTargetSkillsMutation,
    SelectTargetSkillsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SelectTargetSkillsMutation,
    SelectTargetSkillsMutationVariables
  >(SelectTargetSkillsDocument, options);
}
export type SelectTargetSkillsMutationHookResult = ReturnType<
  typeof useSelectTargetSkillsMutation
>;
export type SelectTargetSkillsMutationResult =
  ApolloReactCommon.MutationResult<SelectTargetSkillsMutation>;
export type SelectTargetSkillsMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SelectTargetSkillsMutation,
    SelectTargetSkillsMutationVariables
  >;
export const CompleteOnboardingDocument = gql`
  mutation CompleteOnboarding {
    completeOnboarding {
      ...OnboardingStateFields
    }
  }
  ${OnboardingStateFieldsFragmentDoc}
`;
export type CompleteOnboardingMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    CompleteOnboardingMutation,
    CompleteOnboardingMutationVariables
  >,
) => Promise<any>;

/**
 * __useCompleteOnboardingMutation__
 *
 * To run a mutation, you first call `useCompleteOnboardingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteOnboardingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeOnboardingMutation, { data, loading, error }] = useCompleteOnboardingMutation({
 *   variables: {
 *   },
 * });
 */
export function useCompleteOnboardingMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CompleteOnboardingMutation,
    CompleteOnboardingMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CompleteOnboardingMutation,
    CompleteOnboardingMutationVariables
  >(CompleteOnboardingDocument, options);
}
export type CompleteOnboardingMutationHookResult = ReturnType<
  typeof useCompleteOnboardingMutation
>;
export type CompleteOnboardingMutationResult =
  ApolloReactCommon.MutationResult<CompleteOnboardingMutation>;
export type CompleteOnboardingMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    CompleteOnboardingMutation,
    CompleteOnboardingMutationVariables
  >;
export const SpeakingPromptsDocument = gql`
  query SpeakingPrompts(
    $category: String
    $title: String
    $page: Int
    $size: Int
  ) {
    speakingPrompts(
      category: $category
      title: $title
      page: $page
      size: $size
    ) {
      items {
        ...SpeakingPromptFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${SpeakingPromptFieldsFragmentDoc}
`;

/**
 * __useSpeakingPromptsQuery__
 *
 * To run a query within a React component, call `useSpeakingPromptsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpeakingPromptsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpeakingPromptsQuery({
 *   variables: {
 *      category: // value for 'category'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useSpeakingPromptsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >(SpeakingPromptsDocument, options);
}
export function useSpeakingPromptsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >(SpeakingPromptsDocument, options);
}
export function useSpeakingPromptsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingPromptsQuery,
  SpeakingPromptsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useSpeakingPromptsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingPromptsQuery,
        SpeakingPromptsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingPromptsQuery | undefined,
  SpeakingPromptsQueryVariables
>;
export function useSpeakingPromptsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingPromptsQuery,
        SpeakingPromptsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    SpeakingPromptsQuery,
    SpeakingPromptsQueryVariables
  >(SpeakingPromptsDocument, options as any);
}
export type SpeakingPromptsQueryHookResult = ReturnType<
  typeof useSpeakingPromptsQuery
>;
export type SpeakingPromptsLazyQueryHookResult = ReturnType<
  typeof useSpeakingPromptsLazyQuery
>;
export type SpeakingPromptsSuspenseQueryHookResult = ReturnType<
  typeof useSpeakingPromptsSuspenseQuery
>;
export type SpeakingPromptsQueryResult = ApolloReactCommon.QueryResult<
  SpeakingPromptsQuery,
  SpeakingPromptsQueryVariables
>;
export const SpeakingPromptDocument = gql`
  query SpeakingPrompt($id: ID!) {
    speakingPrompt(id: $id) {
      ...SpeakingPromptFields
    }
  }
  ${SpeakingPromptFieldsFragmentDoc}
`;

/**
 * __useSpeakingPromptQuery__
 *
 * To run a query within a React component, call `useSpeakingPromptQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpeakingPromptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpeakingPromptQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpeakingPromptQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  > &
    (
      | { variables: SpeakingPromptQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  >(SpeakingPromptDocument, options);
}
export function useSpeakingPromptLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  >(SpeakingPromptDocument, options);
}
export function useSpeakingPromptSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingPromptQuery,
  SpeakingPromptQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useSpeakingPromptSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingPromptQuery,
        SpeakingPromptQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingPromptQuery | undefined,
  SpeakingPromptQueryVariables
>;
export function useSpeakingPromptSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingPromptQuery,
        SpeakingPromptQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    SpeakingPromptQuery,
    SpeakingPromptQueryVariables
  >(SpeakingPromptDocument, options as any);
}
export type SpeakingPromptQueryHookResult = ReturnType<
  typeof useSpeakingPromptQuery
>;
export type SpeakingPromptLazyQueryHookResult = ReturnType<
  typeof useSpeakingPromptLazyQuery
>;
export type SpeakingPromptSuspenseQueryHookResult = ReturnType<
  typeof useSpeakingPromptSuspenseQuery
>;
export type SpeakingPromptQueryResult = ApolloReactCommon.QueryResult<
  SpeakingPromptQuery,
  SpeakingPromptQueryVariables
>;
export const SpeakingAttemptDocument = gql`
  query SpeakingAttempt($id: ID!) {
    speakingAttempt(id: $id) {
      ...SpeakingAttemptFields
    }
  }
  ${SpeakingAttemptFieldsFragmentDoc}
`;

/**
 * __useSpeakingAttemptQuery__
 *
 * To run a query within a React component, call `useSpeakingAttemptQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpeakingAttemptQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpeakingAttemptQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSpeakingAttemptQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  > &
    (
      | { variables: SpeakingAttemptQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  >(SpeakingAttemptDocument, options);
}
export function useSpeakingAttemptLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  >(SpeakingAttemptDocument, options);
}
export function useSpeakingAttemptSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingAttemptQuery,
  SpeakingAttemptQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useSpeakingAttemptSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingAttemptQuery,
        SpeakingAttemptQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingAttemptQuery | undefined,
  SpeakingAttemptQueryVariables
>;
export function useSpeakingAttemptSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingAttemptQuery,
        SpeakingAttemptQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    SpeakingAttemptQuery,
    SpeakingAttemptQueryVariables
  >(SpeakingAttemptDocument, options as any);
}
export type SpeakingAttemptQueryHookResult = ReturnType<
  typeof useSpeakingAttemptQuery
>;
export type SpeakingAttemptLazyQueryHookResult = ReturnType<
  typeof useSpeakingAttemptLazyQuery
>;
export type SpeakingAttemptSuspenseQueryHookResult = ReturnType<
  typeof useSpeakingAttemptSuspenseQuery
>;
export type SpeakingAttemptQueryResult = ApolloReactCommon.QueryResult<
  SpeakingAttemptQuery,
  SpeakingAttemptQueryVariables
>;
export const SpeakingAttemptsDocument = gql`
  query SpeakingAttempts($promptId: ID!) {
    speakingAttempts(promptId: $promptId) {
      ...SpeakingAttemptFields
    }
  }
  ${SpeakingAttemptFieldsFragmentDoc}
`;

/**
 * __useSpeakingAttemptsQuery__
 *
 * To run a query within a React component, call `useSpeakingAttemptsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSpeakingAttemptsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSpeakingAttemptsQuery({
 *   variables: {
 *      promptId: // value for 'promptId'
 *   },
 * });
 */
export function useSpeakingAttemptsQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  > &
    (
      | { variables: SpeakingAttemptsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  >(SpeakingAttemptsDocument, options);
}
export function useSpeakingAttemptsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  >(SpeakingAttemptsDocument, options);
}
export function useSpeakingAttemptsSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingAttemptsQuery,
  SpeakingAttemptsQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useSpeakingAttemptsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingAttemptsQuery,
        SpeakingAttemptsQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  SpeakingAttemptsQuery | undefined,
  SpeakingAttemptsQueryVariables
>;
export function useSpeakingAttemptsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        SpeakingAttemptsQuery,
        SpeakingAttemptsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    SpeakingAttemptsQuery,
    SpeakingAttemptsQueryVariables
  >(SpeakingAttemptsDocument, options as any);
}
export type SpeakingAttemptsQueryHookResult = ReturnType<
  typeof useSpeakingAttemptsQuery
>;
export type SpeakingAttemptsLazyQueryHookResult = ReturnType<
  typeof useSpeakingAttemptsLazyQuery
>;
export type SpeakingAttemptsSuspenseQueryHookResult = ReturnType<
  typeof useSpeakingAttemptsSuspenseQuery
>;
export type SpeakingAttemptsQueryResult = ApolloReactCommon.QueryResult<
  SpeakingAttemptsQuery,
  SpeakingAttemptsQueryVariables
>;
export const StartSpeakingAttemptDocument = gql`
  mutation StartSpeakingAttempt(
    $promptId: ID!
    $contentType: String!
    $contentLength: Int!
  ) {
    startSpeakingAttempt(
      promptId: $promptId
      contentType: $contentType
      contentLength: $contentLength
    ) {
      attemptId
      uploadUrl
      contentType
      expiresInSeconds
    }
  }
`;
export type StartSpeakingAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    StartSpeakingAttemptMutation,
    StartSpeakingAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useStartSpeakingAttemptMutation__
 *
 * To run a mutation, you first call `useStartSpeakingAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartSpeakingAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startSpeakingAttemptMutation, { data, loading, error }] = useStartSpeakingAttemptMutation({
 *   variables: {
 *      promptId: // value for 'promptId'
 *      contentType: // value for 'contentType'
 *      contentLength: // value for 'contentLength'
 *   },
 * });
 */
export function useStartSpeakingAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    StartSpeakingAttemptMutation,
    StartSpeakingAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    StartSpeakingAttemptMutation,
    StartSpeakingAttemptMutationVariables
  >(StartSpeakingAttemptDocument, options);
}
export type StartSpeakingAttemptMutationHookResult = ReturnType<
  typeof useStartSpeakingAttemptMutation
>;
export type StartSpeakingAttemptMutationResult =
  ApolloReactCommon.MutationResult<StartSpeakingAttemptMutation>;
export type StartSpeakingAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    StartSpeakingAttemptMutation,
    StartSpeakingAttemptMutationVariables
  >;
export const SubmitSpeakingAttemptDocument = gql`
  mutation SubmitSpeakingAttempt($attemptId: ID!) {
    submitSpeakingAttempt(attemptId: $attemptId) {
      ...SpeakingAttemptFields
    }
  }
  ${SpeakingAttemptFieldsFragmentDoc}
`;
export type SubmitSpeakingAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitSpeakingAttemptMutation,
    SubmitSpeakingAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitSpeakingAttemptMutation__
 *
 * To run a mutation, you first call `useSubmitSpeakingAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitSpeakingAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitSpeakingAttemptMutation, { data, loading, error }] = useSubmitSpeakingAttemptMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *   },
 * });
 */
export function useSubmitSpeakingAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitSpeakingAttemptMutation,
    SubmitSpeakingAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitSpeakingAttemptMutation,
    SubmitSpeakingAttemptMutationVariables
  >(SubmitSpeakingAttemptDocument, options);
}
export type SubmitSpeakingAttemptMutationHookResult = ReturnType<
  typeof useSubmitSpeakingAttemptMutation
>;
export type SubmitSpeakingAttemptMutationResult =
  ApolloReactCommon.MutationResult<SubmitSpeakingAttemptMutation>;
export type SubmitSpeakingAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitSpeakingAttemptMutation,
    SubmitSpeakingAttemptMutationVariables
  >;
export const DailyPathDocument = gql`
  query DailyPath {
    dailyPath {
      streakDays
      totalXp
      level
      xpIntoLevel
      levelCostXp
      tasks {
        kind
        status
        targetId
        title
        order
        unitsRemaining
        unitsDoneToday
        completionPercent
        xpReward
      }
      quests {
        kind
        progress
        target
        completed
      }
    }
  }
`;

/**
 * __useDailyPathQuery__
 *
 * To run a query within a React component, call `useDailyPathQuery` and pass it any options that fit your needs.
 * When your component renders, `useDailyPathQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDailyPathQuery({
 *   variables: {
 *   },
 * });
 */
export function useDailyPathQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    DailyPathQuery,
    DailyPathQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<DailyPathQuery, DailyPathQueryVariables>(
    DailyPathDocument,
    options,
  );
}
export function useDailyPathLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    DailyPathQuery,
    DailyPathQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<DailyPathQuery, DailyPathQueryVariables>(
    DailyPathDocument,
    options,
  );
}
export function useDailyPathSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    DailyPathQuery,
    DailyPathQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DailyPathQuery,
  DailyPathQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useDailyPathSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DailyPathQuery,
        DailyPathQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  DailyPathQuery | undefined,
  DailyPathQueryVariables
>;
export function useDailyPathSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        DailyPathQuery,
        DailyPathQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    DailyPathQuery,
    DailyPathQueryVariables
  >(DailyPathDocument, options as any);
}
export type DailyPathQueryHookResult = ReturnType<typeof useDailyPathQuery>;
export type DailyPathLazyQueryHookResult = ReturnType<
  typeof useDailyPathLazyQuery
>;
export type DailyPathSuspenseQueryHookResult = ReturnType<
  typeof useDailyPathSuspenseQuery
>;
export type DailyPathQueryResult = ApolloReactCommon.QueryResult<
  DailyPathQuery,
  DailyPathQueryVariables
>;
export const QuizzesDocument = gql`
  query Quizzes($category: String, $title: String, $page: Int, $size: Int) {
    quizzes(category: $category, title: $title, page: $page, size: $size) {
      items {
        ...QuizFields
      }
      page
      size
      totalItems
      totalPages
    }
  }
  ${QuizFieldsFragmentDoc}
`;

/**
 * __useQuizzesQuery__
 *
 * To run a query within a React component, call `useQuizzesQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuizzesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuizzesQuery({
 *   variables: {
 *      category: // value for 'category'
 *      title: // value for 'title'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useQuizzesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    QuizzesQuery,
    QuizzesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<QuizzesQuery, QuizzesQueryVariables>(
    QuizzesDocument,
    options,
  );
}
export function useQuizzesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    QuizzesQuery,
    QuizzesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<QuizzesQuery, QuizzesQueryVariables>(
    QuizzesDocument,
    options,
  );
}
export function useQuizzesSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    QuizzesQuery,
    QuizzesQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<QuizzesQuery, QuizzesQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useQuizzesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        QuizzesQuery,
        QuizzesQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  QuizzesQuery | undefined,
  QuizzesQueryVariables
>;
export function useQuizzesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        QuizzesQuery,
        QuizzesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<QuizzesQuery, QuizzesQueryVariables>(
    QuizzesDocument,
    options as any,
  );
}
export type QuizzesQueryHookResult = ReturnType<typeof useQuizzesQuery>;
export type QuizzesLazyQueryHookResult = ReturnType<typeof useQuizzesLazyQuery>;
export type QuizzesSuspenseQueryHookResult = ReturnType<
  typeof useQuizzesSuspenseQuery
>;
export type QuizzesQueryResult = ApolloReactCommon.QueryResult<
  QuizzesQuery,
  QuizzesQueryVariables
>;
export const StartQuizAttemptDocument = gql`
  mutation StartQuizAttempt($quizId: ID!) {
    startQuizAttempt(quizId: $quizId) {
      ...QuizAttemptFields
    }
  }
  ${QuizAttemptFieldsFragmentDoc}
`;
export type StartQuizAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    StartQuizAttemptMutation,
    StartQuizAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useStartQuizAttemptMutation__
 *
 * To run a mutation, you first call `useStartQuizAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartQuizAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startQuizAttemptMutation, { data, loading, error }] = useStartQuizAttemptMutation({
 *   variables: {
 *      quizId: // value for 'quizId'
 *   },
 * });
 */
export function useStartQuizAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    StartQuizAttemptMutation,
    StartQuizAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    StartQuizAttemptMutation,
    StartQuizAttemptMutationVariables
  >(StartQuizAttemptDocument, options);
}
export type StartQuizAttemptMutationHookResult = ReturnType<
  typeof useStartQuizAttemptMutation
>;
export type StartQuizAttemptMutationResult =
  ApolloReactCommon.MutationResult<StartQuizAttemptMutation>;
export type StartQuizAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    StartQuizAttemptMutation,
    StartQuizAttemptMutationVariables
  >;
export const QuizPaperDocument = gql`
  query QuizPaper($attemptId: ID!) {
    quizPaper(attemptId: $attemptId) {
      attemptId
      quizId
      title
      description
      timeLimitSeconds
      expiresAt
      questions {
        id
        orderNo
        questionType
        title
        prompt
        points
        beforeText
        afterText
        originalSentence
        rewriteKeyword
        options {
          id
          orderNo
          label
          content
        }
        wordBank
        scrambledWords
        leftTexts
        rightTexts
      }
    }
  }
`;

/**
 * __useQuizPaperQuery__
 *
 * To run a query within a React component, call `useQuizPaperQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuizPaperQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuizPaperQuery({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *   },
 * });
 */
export function useQuizPaperQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    QuizPaperQuery,
    QuizPaperQueryVariables
  > &
    (
      { variables: QuizPaperQueryVariables; skip?: boolean } | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<QuizPaperQuery, QuizPaperQueryVariables>(
    QuizPaperDocument,
    options,
  );
}
export function useQuizPaperLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    QuizPaperQuery,
    QuizPaperQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<QuizPaperQuery, QuizPaperQueryVariables>(
    QuizPaperDocument,
    options,
  );
}
export function useQuizPaperSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    QuizPaperQuery,
    QuizPaperQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  QuizPaperQuery,
  QuizPaperQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useQuizPaperSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        QuizPaperQuery,
        QuizPaperQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  QuizPaperQuery | undefined,
  QuizPaperQueryVariables
>;
export function useQuizPaperSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        QuizPaperQuery,
        QuizPaperQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    QuizPaperQuery,
    QuizPaperQueryVariables
  >(QuizPaperDocument, options as any);
}
export type QuizPaperQueryHookResult = ReturnType<typeof useQuizPaperQuery>;
export type QuizPaperLazyQueryHookResult = ReturnType<
  typeof useQuizPaperLazyQuery
>;
export type QuizPaperSuspenseQueryHookResult = ReturnType<
  typeof useQuizPaperSuspenseQuery
>;
export type QuizPaperQueryResult = ApolloReactCommon.QueryResult<
  QuizPaperQuery,
  QuizPaperQueryVariables
>;
export const SubmitQuizAttemptDocument = gql`
  mutation SubmitQuizAttempt($attemptId: ID!, $answers: [QuizAnswerInput!]!) {
    submitQuizAttempt(attemptId: $attemptId, answers: $answers) {
      ...QuizAttemptFields
      reviews {
        ...QuizReviewFields
      }
    }
  }
  ${QuizAttemptFieldsFragmentDoc}
  ${QuizReviewFieldsFragmentDoc}
`;
export type SubmitQuizAttemptMutationFn = (
  options?: ApolloReactCommon.MutationFunctionOptions<
    SubmitQuizAttemptMutation,
    SubmitQuizAttemptMutationVariables
  >,
) => Promise<any>;

/**
 * __useSubmitQuizAttemptMutation__
 *
 * To run a mutation, you first call `useSubmitQuizAttemptMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitQuizAttemptMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitQuizAttemptMutation, { data, loading, error }] = useSubmitQuizAttemptMutation({
 *   variables: {
 *      attemptId: // value for 'attemptId'
 *      answers: // value for 'answers'
 *   },
 * });
 */
export function useSubmitQuizAttemptMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SubmitQuizAttemptMutation,
    SubmitQuizAttemptMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    SubmitQuizAttemptMutation,
    SubmitQuizAttemptMutationVariables
  >(SubmitQuizAttemptDocument, options);
}
export type SubmitQuizAttemptMutationHookResult = ReturnType<
  typeof useSubmitQuizAttemptMutation
>;
export type SubmitQuizAttemptMutationResult =
  ApolloReactCommon.MutationResult<SubmitQuizAttemptMutation>;
export type SubmitQuizAttemptMutationOptions =
  ApolloReactCommon.MutationHookOptions<
    SubmitQuizAttemptMutation,
    SubmitQuizAttemptMutationVariables
  >;
export const CurrentUserDocument = gql`
  query CurrentUser {
    me {
      id
      email
      fullName
      displayName
      gender
      birthDate
      avatarUrl
      bannerUrl
      onboardingStep
      role
      onboardingState {
        certificateLearner
        currentLevel
        targetCertificateType
        targetScore
        targetDate
        targetSkills
      }
    }
  }
`;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(
    CurrentUserDocument,
    options,
  );
}
export function useCurrentUserLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >(CurrentUserDocument, options);
}
export function useCurrentUserSuspenseQuery(
  baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CurrentUserQuery,
  CurrentUserQueryVariables
>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useCurrentUserSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CurrentUserQuery,
        CurrentUserQueryVariables
      >,
): ApolloReactHooks.UseSuspenseQueryResult<
  CurrentUserQuery | undefined,
  CurrentUserQueryVariables
>;
export function useCurrentUserSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        CurrentUserQuery,
        CurrentUserQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    CurrentUserQuery,
    CurrentUserQueryVariables
  >(CurrentUserDocument, options as any);
}
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<
  typeof useCurrentUserLazyQuery
>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<
  typeof useCurrentUserSuspenseQuery
>;
export type CurrentUserQueryResult = ApolloReactCommon.QueryResult<
  CurrentUserQuery,
  CurrentUserQueryVariables
>;
