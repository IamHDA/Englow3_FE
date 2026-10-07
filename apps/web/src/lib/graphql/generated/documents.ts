/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import type * as Types from "./schemaTypes";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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
      certificateLearner: boolean;
      currentLevel: Types.CefrLevel | null;
      targetCertificateType: string | null;
      targetScore: number | null;
      targetDate: string | null;
      targetSkills: Array<Types.LearningSkill>;
    } | null;
  };
};

export type AdminOverviewQueryVariables = Exact<{ [key: string]: never }>;

export type AdminOverviewQuery = {
  adminOverview: {
    pendingReviewTotal: number;
    learners: number;
    newLearners: number;
    activeLearners: number;
    cardReviews: number;
    dictationSentences: number;
    quizzesSubmitted: number;
    examsSubmitted: number;
    periodDays: number;
    content: Array<{
      kind: Types.OverviewContentKind;
      drafts: number;
      pendingReview: number;
      published: number;
    }>;
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

export type AssessmentTaskFieldsFragment = {
  id: string;
  skill: Types.AssessmentSkill;
  title: string;
  taskType: string;
  instructions: string;
  rubricNotes: string | null;
  sampleAnswer: string | null;
  minimumWords: number;
  timeLimitSeconds: number;
  status: Types.AssessmentTaskStatus;
  reviewNote: string | null;
  version: number;
};

export type AssessmentAttemptFieldsFragment = {
  id: string;
  taskId: string;
  skill: Types.AssessmentSkill;
  status: Types.AssessmentAttemptStatus;
  answerText: string;
  audioUrl: string | null;
  recognizedText: string | null;
  report: string | null;
  source: string | null;
  errorCode: string | null;
  wordCount: number;
  version: number;
  createdAt: string;
  submittedAt: string | null;
  assessedAt: string | null;
  learnerId: string | null;
  learnerName: string | null;
  task: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
};

export type AssessmentWorkloadQueryVariables = Exact<{ [key: string]: never }>;

export type AssessmentWorkloadQuery = {
  assessmentWorkload: {
    drafts: number;
    rejected: number;
    pendingReview: number;
    published: number;
    needsReview: number;
    failed: number;
    completed: number;
  };
};

export type AssessmentAuthoringTaskDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type AssessmentAuthoringTaskDetailQuery = {
  authoringAssessmentTask: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
};

export type AssessmentReviewsQueryVariables = Exact<{
  id: string | number;
}>;

export type AssessmentReviewsQuery = {
  assessmentReviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string | null;
    previousReport: string | null;
    report: string;
    note: string;
    createdAt: string;
  }>;
};

export type AssessmentCatalogQueryVariables = Exact<{
  skill?: Types.AssessmentSkill | null | undefined;
  page?: number | null | undefined;
}>;

export type AssessmentCatalogQuery = {
  assessmentCapabilities: {
    automaticWriting: boolean;
    automaticSpeaking: boolean;
    humanReview: boolean;
  };
  assessmentTasks: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Array<{
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    }>;
  };
};

export type AssessmentTaskDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type AssessmentTaskDetailQuery = {
  assessmentTask: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
  assessmentCapabilities: {
    automaticWriting: boolean;
    automaticSpeaking: boolean;
    humanReview: boolean;
  };
};

export type AssessmentAttemptDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type AssessmentAttemptDetailQuery = {
  assessmentAttempt: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentHistoryQueryVariables = Exact<{
  taskId?: string | number | null | undefined;
  skill?: Types.AssessmentSkill | null | undefined;
  status?: Types.AssessmentAttemptStatus | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
}>;

export type AssessmentHistoryQuery = {
  assessmentHistory: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Array<{
      id: string;
      taskId: string;
      skill: Types.AssessmentSkill;
      status: Types.AssessmentAttemptStatus;
      answerText: string;
      audioUrl: string | null;
      recognizedText: string | null;
      report: string | null;
      source: string | null;
      errorCode: string | null;
      wordCount: number;
      version: number;
      createdAt: string;
      submittedAt: string | null;
      assessedAt: string | null;
      learnerId: string | null;
      learnerName: string | null;
      task: {
        id: string;
        skill: Types.AssessmentSkill;
        title: string;
        taskType: string;
        instructions: string;
        rubricNotes: string | null;
        sampleAnswer: string | null;
        minimumWords: number;
        timeLimitSeconds: number;
        status: Types.AssessmentTaskStatus;
        reviewNote: string | null;
        version: number;
      };
    }>;
  };
};

export type AssessmentAuthoringQueryVariables = Exact<{
  skill?: Types.AssessmentSkill | null | undefined;
  status?: Types.AssessmentTaskStatus | null | undefined;
  page?: number | null | undefined;
}>;

export type AssessmentAuthoringQuery = {
  authoringAssessmentTasks: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Array<{
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    }>;
  };
};

export type AssessmentReviewQueueQueryVariables = Exact<{
  status?: Types.AssessmentAttemptStatus | null | undefined;
  skill?: Types.AssessmentSkill | null | undefined;
  term?: string | null | undefined;
  oldest?: boolean | null | undefined;
  page?: number | null | undefined;
}>;

export type AssessmentReviewQueueQuery = {
  assessmentSubmissions: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Array<{
      id: string;
      skill: Types.AssessmentSkill;
      status: Types.AssessmentAttemptStatus;
      submittedAt: string | null;
      version: number;
      learnerId: string;
      learnerName: string | null;
      task: { id: string; title: string };
    }>;
  };
};

export type AssessmentSubmissionDetailQueryVariables = Exact<{
  id: string | number;
}>;

export type AssessmentSubmissionDetailQuery = {
  assessmentSubmission: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentStartMutationVariables = Exact<{
  taskId: string | number;
  clientKey: string | number;
  contentType?: string | null | undefined;
  contentLength?: number | null | undefined;
}>;

export type AssessmentStartMutation = {
  startAssessment: {
    uploadUrl: string | null;
    attempt: {
      id: string;
      taskId: string;
      skill: Types.AssessmentSkill;
      status: Types.AssessmentAttemptStatus;
      answerText: string;
      audioUrl: string | null;
      recognizedText: string | null;
      report: string | null;
      source: string | null;
      errorCode: string | null;
      wordCount: number;
      version: number;
      createdAt: string;
      submittedAt: string | null;
      assessedAt: string | null;
      learnerId: string | null;
      learnerName: string | null;
      task: {
        id: string;
        skill: Types.AssessmentSkill;
        title: string;
        taskType: string;
        instructions: string;
        rubricNotes: string | null;
        sampleAnswer: string | null;
        minimumWords: number;
        timeLimitSeconds: number;
        status: Types.AssessmentTaskStatus;
        reviewNote: string | null;
        version: number;
      };
    };
  };
};

export type AssessmentSaveDraftMutationVariables = Exact<{
  id: string | number;
  answerText: string;
  version: number;
}>;

export type AssessmentSaveDraftMutation = {
  saveAssessmentDraft: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentSubmitMutationVariables = Exact<{
  id: string | number;
}>;

export type AssessmentSubmitMutation = {
  submitAssessment: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentRetryMutationVariables = Exact<{
  id: string | number;
}>;

export type AssessmentRetryMutation = {
  retryAssessment: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentRequestReviewMutationVariables = Exact<{
  id: string | number;
}>;

export type AssessmentRequestReviewMutation = {
  requestAssessmentReview: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentCreateTaskMutationVariables = Exact<{
  input: Types.AssessmentTaskInput;
}>;

export type AssessmentCreateTaskMutation = {
  createAssessmentTask: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
};

export type AssessmentEditTaskMutationVariables = Exact<{
  id: string | number;
  version: number;
  input: Types.AssessmentTaskInput;
}>;

export type AssessmentEditTaskMutation = {
  editAssessmentTask: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
};

export type AssessmentTransitionTaskMutationVariables = Exact<{
  id: string | number;
  action: string;
  note?: string | null | undefined;
}>;

export type AssessmentTransitionTaskMutation = {
  transitionAssessmentTask: {
    id: string;
    skill: Types.AssessmentSkill;
    title: string;
    taskType: string;
    instructions: string;
    rubricNotes: string | null;
    sampleAnswer: string | null;
    minimumWords: number;
    timeLimitSeconds: number;
    status: Types.AssessmentTaskStatus;
    reviewNote: string | null;
    version: number;
  };
};

export type AssessmentGradeMutationVariables = Exact<{
  id: string | number;
  report: string;
  note: string;
  transcript?: string | null | undefined;
  version: number;
}>;

export type AssessmentGradeMutation = {
  gradeAssessment: {
    id: string;
    taskId: string;
    skill: Types.AssessmentSkill;
    status: Types.AssessmentAttemptStatus;
    answerText: string;
    audioUrl: string | null;
    recognizedText: string | null;
    report: string | null;
    source: string | null;
    errorCode: string | null;
    wordCount: number;
    version: number;
    createdAt: string;
    submittedAt: string | null;
    assessedAt: string | null;
    learnerId: string | null;
    learnerName: string | null;
    task: {
      id: string;
      skill: Types.AssessmentSkill;
      title: string;
      taskType: string;
      instructions: string;
      rubricNotes: string | null;
      sampleAnswer: string | null;
      minimumWords: number;
      timeLimitSeconds: number;
      status: Types.AssessmentTaskStatus;
      reviewNote: string | null;
      version: number;
    };
  };
};

export type AssessmentNotificationsQueryVariables = Exact<{
  page?: number | null | undefined;
}>;

export type AssessmentNotificationsQuery = {
  assessmentNotifications: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Array<{
      attemptId: string;
      title: string;
      skill: Types.AssessmentSkill;
      version: number;
      assessedAt: string;
    }>;
  };
};

export type AssessmentReadResultMutationVariables = Exact<{
  id: string | number;
  version: number;
}>;

export type AssessmentReadResultMutation = { readAssessmentResult: boolean };

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

export type RestoreContentMutationVariables = Exact<{
  kind: Types.ContentKind;
  id: string | number;
}>;

export type RestoreContentMutation = {
  restoreContent: {
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
    cleared: boolean;
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
    audioUrl: string;
    audioDurationSeconds: number;
    audioStartMs: number | null;
    audioEndMs: number | null;
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

export type RestoreExamMutationVariables = Exact<{
  id: string | number;
}>;

export type RestoreExamMutation = {
  restoreExam: {
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
  maxRawScore: number;
  scorePercentage: number | null;
  correctAnswerCount: number | null;
  questionCount: number;
  resumed: boolean;
  examTitle: string | null;
  mode: Types.ExamAttemptMode;
  timeLimitSeconds: number | null;
  parts: Array<{
    id: string;
    sectionType: string | null;
    title: string | null;
  }>;
};

export type ExamDraftQueryVariables = Exact<{
  attemptId: string | number;
}>;

export type ExamDraftQuery = {
  examDraft: {
    version: number;
    savedAt: string;
    answers: Array<{ questionId: string; selectedOptionIds: Array<string> }>;
  };
};

export type SaveExamDraftMutationVariables = Exact<{
  attemptId: string | number;
  version: number;
  answers: Array<Types.SubmitAnswerInput> | Types.SubmitAnswerInput;
}>;

export type SaveExamDraftMutation = {
  saveExamDraft: {
    version: number;
    savedAt: string;
    answers: Array<{ questionId: string; selectedOptionIds: Array<string> }>;
  };
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
  input?: Types.StartExamAttemptInput | null | undefined;
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
    maxRawScore: number;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
    mode: Types.ExamAttemptMode;
    timeLimitSeconds: number | null;
    parts: Array<{
      id: string;
      sectionType: string | null;
      title: string | null;
    }>;
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
    maxRawScore: number;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
    mode: Types.ExamAttemptMode;
    timeLimitSeconds: number | null;
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
    parts: Array<{
      id: string;
      sectionType: string | null;
      title: string | null;
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
    maxRawScore: number;
    scorePercentage: number | null;
    correctAnswerCount: number | null;
    questionCount: number;
    resumed: boolean;
    examTitle: string | null;
    mode: Types.ExamAttemptMode;
    timeLimitSeconds: number | null;
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
    parts: Array<{
      id: string;
      sectionType: string | null;
      title: string | null;
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
      maxRawScore: number;
      scorePercentage: number | null;
      correctAnswerCount: number | null;
      questionCount: number;
      resumed: boolean;
      examTitle: string | null;
      mode: Types.ExamAttemptMode;
      timeLimitSeconds: number | null;
      parts: Array<{
        id: string;
        sectionType: string | null;
        title: string | null;
      }>;
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

export type ExamOutlineQueryVariables = Exact<{
  examId: string | number;
}>;

export type ExamOutlineQuery = {
  examOutline: {
    examId: string;
    sections: Array<{
      id: string;
      sectionType: string;
      orderNo: number;
      parts: Array<{
        id: string;
        orderNo: number;
        title: string;
        questionCount: number;
      }>;
    }>;
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
  step: Types.OnboardingStep;
  learningPurposeIds: Array<number>;
  certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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
    step: Types.OnboardingStep;
    learningPurposeIds: Array<number>;
    certificateLearner: boolean;
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

export type MyTourStatusQueryVariables = Exact<{ [key: string]: never }>;

export type MyTourStatusQuery = { myTourStatus: { completed: boolean } };

export type CompleteMyTourMutationVariables = Exact<{ [key: string]: never }>;

export type CompleteMyTourMutation = { completeMyTour: { completed: boolean } };

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
      certificateLearner: boolean;
      currentLevel: Types.CefrLevel | null;
      targetCertificateType: string | null;
      targetScore: number | null;
      targetDate: string | null;
      targetSkills: Array<Types.LearningSkill>;
    } | null;
  };
};

export const TutorMessageFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorMessageFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorMessage" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "model" } },
          { kind: "Field", name: { kind: "Name", value: "reported" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "answeredAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TutorMessageFieldsFragment, unknown>;
export const TutorConversationSummaryFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorConversationSummaryFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorConversationSummary" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "messageCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastMessageAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TutorConversationSummaryFieldsFragment, unknown>;
export const AssessmentTaskFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssessmentTaskFieldsFragment, unknown>;
export const AssessmentAttemptFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssessmentAttemptFieldsFragment, unknown>;
export const ContentReviewFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ContentReviewFieldsFragment, unknown>;
export const DictationLessonFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DictationLessonFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "DictationLesson" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "sentenceCount" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completedSentenceCount" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "totalDurationSeconds" },
          },
          { kind: "Field", name: { kind: "Name", value: "lastPractisedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DictationLessonFieldsFragment, unknown>;
export const DictationSentenceFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DictationSentenceFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "DictationSentence" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "audioDurationSeconds" },
          },
          { kind: "Field", name: { kind: "Name", value: "hintWordCount" } },
          { kind: "Field", name: { kind: "Name", value: "hintFirstLetters" } },
          { kind: "Field", name: { kind: "Name", value: "hintRevealWord" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "hintPartialTranscript" },
          },
          { kind: "Field", name: { kind: "Name", value: "audioStartMs" } },
          { kind: "Field", name: { kind: "Name", value: "audioEndMs" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "bestAccuracyPercent" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DictationSentenceFieldsFragment, unknown>;
export const AdminExamFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamListItem" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "examType" } },
          { kind: "Field", name: { kind: "Name", value: "certificateType" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateVariant" },
          },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminExamFieldsFragment, unknown>;
export const AdminExamShellFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminExamShellFieldsFragment, unknown>;
export const ExamAttemptFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExamAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "examId" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "scoredAt" } },
          { kind: "Field", name: { kind: "Name", value: "rawScore" } },
          { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
          { kind: "Field", name: { kind: "Name", value: "examTitle" } },
          { kind: "Field", name: { kind: "Name", value: "mode" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "parts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "sectionType" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExamAttemptFieldsFragment, unknown>;
export const AttemptReviewFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AttemptReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AttemptQuestionReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "questionId" } },
          { kind: "Field", name: { kind: "Name", value: "selectedOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correctOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correct" } },
          { kind: "Field", name: { kind: "Name", value: "awardedRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "explanation" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "options" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "optionId" } },
                { kind: "Field", name: { kind: "Name", value: "correct" } },
                { kind: "Field", name: { kind: "Name", value: "explanation" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AttemptReviewFieldsFragment, unknown>;
export const FlashcardSetFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardSetFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "FlashcardSet" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "cardCount" } },
          { kind: "Field", name: { kind: "Name", value: "dueCount" } },
          { kind: "Field", name: { kind: "Name", value: "masteredCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastStudiedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FlashcardSetFieldsFragment, unknown>;
export const FlashcardFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Flashcard" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "lemma" } },
          { kind: "Field", name: { kind: "Name", value: "partOfSpeech" } },
          { kind: "Field", name: { kind: "Name", value: "senseLabel" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUs" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUk" } },
          { kind: "Field", name: { kind: "Name", value: "audioUsUrl" } },
          { kind: "Field", name: { kind: "Name", value: "audioUkUrl" } },
          { kind: "Field", name: { kind: "Name", value: "definitionEn" } },
          { kind: "Field", name: { kind: "Name", value: "definitionVi" } },
          { kind: "Field", name: { kind: "Name", value: "exampleSentence" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "exampleTranslationVi" },
          },
          { kind: "Field", name: { kind: "Name", value: "mnemonicTipVi" } },
          { kind: "Field", name: { kind: "Name", value: "cefrLevel" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "dueAt" } },
          { kind: "Field", name: { kind: "Name", value: "lapseCount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FlashcardFieldsFragment, unknown>;
export const OnboardingStateFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OnboardingStateFieldsFragment, unknown>;
export const SpeakingPromptFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingPromptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingPrompt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "ipaTranscript" } },
          { kind: "Field", name: { kind: "Name", value: "translationVi" } },
          { kind: "Field", name: { kind: "Name", value: "phonemeTarget" } },
          { kind: "Field", name: { kind: "Name", value: "tips" } },
          { kind: "Field", name: { kind: "Name", value: "bestScorePercent" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SpeakingPromptFieldsFragment, unknown>;
export const SpeakingAttemptFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "speakingPromptId" } },
          { kind: "Field", name: { kind: "Name", value: "promptTitle" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "accuracyPercent" } },
          { kind: "Field", name: { kind: "Name", value: "fluencyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completenessPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "prosodyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "pronunciationPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "words" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "orderNo" } },
                { kind: "Field", name: { kind: "Name", value: "word" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "accuracyPercent" },
                },
                { kind: "Field", name: { kind: "Name", value: "errorType" } },
                { kind: "Field", name: { kind: "Name", value: "offsetMs" } },
                { kind: "Field", name: { kind: "Name", value: "durationMs" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "phonemes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "phoneme" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracy" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SpeakingAttemptFieldsFragment, unknown>;
export const QuizFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Quiz" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "passingScorePercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "bestScorePercent" } },
          { kind: "Field", name: { kind: "Name", value: "attemptCount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QuizFieldsFragment, unknown>;
export const QuizAttemptFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "QuizAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "quizId" } },
          { kind: "Field", name: { kind: "Name", value: "quizTitle" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "score" } },
          { kind: "Field", name: { kind: "Name", value: "maxScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "passed" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QuizAttemptFieldsFragment, unknown>;
export const QuizReviewFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "QuizQuestionReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "questionId" } },
          { kind: "Field", name: { kind: "Name", value: "questionType" } },
          { kind: "Field", name: { kind: "Name", value: "prompt" } },
          { kind: "Field", name: { kind: "Name", value: "userAnswerText" } },
          { kind: "Field", name: { kind: "Name", value: "correctAnswerText" } },
          { kind: "Field", name: { kind: "Name", value: "correct" } },
          { kind: "Field", name: { kind: "Name", value: "pointsEarned" } },
          { kind: "Field", name: { kind: "Name", value: "pointsPossible" } },
          { kind: "Field", name: { kind: "Name", value: "explanation" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QuizReviewFieldsFragment, unknown>;
export const UpdateProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdateProfileInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "fullName" } },
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
                { kind: "Field", name: { kind: "Name", value: "gender" } },
                { kind: "Field", name: { kind: "Name", value: "birthDate" } },
                { kind: "Field", name: { kind: "Name", value: "avatarUrl" } },
                { kind: "Field", name: { kind: "Name", value: "bannerUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "onboardingStep" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "onboardingState" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "certificateLearner" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "currentLevel" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetCertificateType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetSkills" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const AdminOverviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AdminOverview" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminOverview" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "content" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "drafts" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "pendingReview" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "published" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pendingReviewTotal" },
                },
                { kind: "Field", name: { kind: "Name", value: "learners" } },
                { kind: "Field", name: { kind: "Name", value: "newLearners" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activeLearners" },
                },
                { kind: "Field", name: { kind: "Name", value: "cardReviews" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "dictationSentences" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "quizzesSubmitted" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "examsSubmitted" },
                },
                { kind: "Field", name: { kind: "Name", value: "periodDays" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminOverviewQuery, AdminOverviewQueryVariables>;
export const TutorConversationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TutorConversations" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tutorConversations" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "TutorConversationSummaryFields",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorConversationSummaryFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorConversationSummary" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "messageCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastMessageAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TutorConversationsQuery,
  TutorConversationsQueryVariables
>;
export const TutorConversationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TutorConversation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tutorConversation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversation" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "TutorConversationSummaryFields",
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "messages" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "TutorMessageFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorConversationSummaryFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorConversationSummary" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "messageCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastMessageAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorMessageFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorMessage" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "model" } },
          { kind: "Field", name: { kind: "Name", value: "reported" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "answeredAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  TutorConversationQuery,
  TutorConversationQueryVariables
>;
export const SendTutorMessageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SendTutorMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "message" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "topic" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sendTutorMessage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "conversationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "conversationId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "message" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "message" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "topic" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "topic" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversation" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "TutorConversationSummaryFields",
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "messages" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "TutorMessageFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorConversationSummaryFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorConversationSummary" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "messageCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastMessageAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorMessageFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorMessage" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "model" } },
          { kind: "Field", name: { kind: "Name", value: "reported" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "answeredAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendTutorMessageMutation,
  SendTutorMessageMutationVariables
>;
export const ArchiveTutorConversationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ArchiveTutorConversation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "archiveTutorConversation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "TutorConversationSummaryFields",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorConversationSummaryFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorConversationSummary" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "messageCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastMessageAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ArchiveTutorConversationMutation,
  ArchiveTutorConversationMutationVariables
>;
export const ReportTutorMessageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ReportTutorMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "messageId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "reportTutorMessage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "conversationId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "conversationId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "messageId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "messageId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TutorMessageFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TutorMessageFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "TutorMessage" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "role" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "model" } },
          { kind: "Field", name: { kind: "Name", value: "reported" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "answeredAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ReportTutorMessageMutation,
  ReportTutorMessageMutationVariables
>;
export const AssessmentWorkloadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentWorkload" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentWorkload" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "drafts" } },
                { kind: "Field", name: { kind: "Name", value: "rejected" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pendingReview" },
                },
                { kind: "Field", name: { kind: "Name", value: "published" } },
                { kind: "Field", name: { kind: "Name", value: "needsReview" } },
                { kind: "Field", name: { kind: "Name", value: "failed" } },
                { kind: "Field", name: { kind: "Name", value: "completed" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentWorkloadQuery,
  AssessmentWorkloadQueryVariables
>;
export const AssessmentAuthoringTaskDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentAuthoringTaskDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authoringAssessmentTask" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentAuthoringTaskDetailQuery,
  AssessmentAuthoringTaskDetailQueryVariables
>;
export const AssessmentReviewsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentReviews" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentReviews" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "reviewerId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reviewerName" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "previousReport" },
                },
                { kind: "Field", name: { kind: "Name", value: "report" } },
                { kind: "Field", name: { kind: "Name", value: "note" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentReviewsQuery,
  AssessmentReviewsQueryVariables
>;
export const AssessmentCatalogDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentCatalog" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "skill" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentSkill" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentCapabilities" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "automaticWriting" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "automaticSpeaking" },
                },
                { kind: "Field", name: { kind: "Name", value: "humanReview" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentTasks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "skill" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "skill" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AssessmentTaskFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentCatalogQuery,
  AssessmentCatalogQueryVariables
>;
export const AssessmentTaskDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentTaskDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentTask" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentCapabilities" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "automaticWriting" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "automaticSpeaking" },
                },
                { kind: "Field", name: { kind: "Name", value: "humanReview" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentTaskDetailQuery,
  AssessmentTaskDetailQueryVariables
>;
export const AssessmentAttemptDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentAttemptDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentAttemptDetailQuery,
  AssessmentAttemptDetailQueryVariables
>;
export const AssessmentHistoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentHistory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "taskId" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "skill" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentSkill" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentAttemptStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentHistory" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "taskId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "taskId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "skill" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "skill" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "AssessmentAttemptFields",
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentHistoryQuery,
  AssessmentHistoryQueryVariables
>;
export const AssessmentAuthoringDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentAuthoring" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "skill" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentSkill" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentTaskStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "authoringAssessmentTasks" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "skill" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "skill" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AssessmentTaskFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentAuthoringQuery,
  AssessmentAuthoringQueryVariables
>;
export const AssessmentReviewQueueDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentReviewQueue" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentAttemptStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "skill" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "AssessmentSkill" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "term" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "oldest" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentSubmissions" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "skill" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "skill" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "term" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "term" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "oldest" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "oldest" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "skill" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "submittedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "version" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "learnerId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "learnerName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "task" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentReviewQueueQuery,
  AssessmentReviewQueueQueryVariables
>;
export const AssessmentSubmissionDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentSubmissionDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentSubmission" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentSubmissionDetailQuery,
  AssessmentSubmissionDetailQueryVariables
>;
export const AssessmentStartDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentStart" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "taskId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "clientKey" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "contentType" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "contentLength" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startAssessment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "taskId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "taskId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "clientKey" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "clientKey" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "contentType" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentLength" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "contentLength" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "attempt" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "AssessmentAttemptFields",
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "uploadUrl" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentStartMutation,
  AssessmentStartMutationVariables
>;
export const AssessmentSaveDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentSaveDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "answerText" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "version" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "saveAssessmentDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "answerText" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "answerText" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "version" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentSaveDraftMutation,
  AssessmentSaveDraftMutationVariables
>;
export const AssessmentSubmitDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentSubmit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitAssessment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentSubmitMutation,
  AssessmentSubmitMutationVariables
>;
export const AssessmentRetryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentRetry" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "retryAssessment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentRetryMutation,
  AssessmentRetryMutationVariables
>;
export const AssessmentRequestReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentRequestReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requestAssessmentReview" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentRequestReviewMutation,
  AssessmentRequestReviewMutationVariables
>;
export const AssessmentCreateTaskDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentCreateTask" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "AssessmentTaskInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAssessmentTask" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentCreateTaskMutation,
  AssessmentCreateTaskMutationVariables
>;
export const AssessmentEditTaskDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentEditTask" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "version" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "AssessmentTaskInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "editAssessmentTask" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "version" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentEditTaskMutation,
  AssessmentEditTaskMutationVariables
>;
export const AssessmentTransitionTaskDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentTransitionTask" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "action" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "transitionAssessmentTask" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "action" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "action" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentTransitionTaskMutation,
  AssessmentTransitionTaskMutationVariables
>;
export const AssessmentGradeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentGrade" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "report" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "transcript" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "version" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "gradeAssessment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "report" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "report" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "transcript" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "transcript" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "version" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentTaskFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentTask" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "taskType" } },
          { kind: "Field", name: { kind: "Name", value: "instructions" } },
          { kind: "Field", name: { kind: "Name", value: "rubricNotes" } },
          { kind: "Field", name: { kind: "Name", value: "sampleAnswer" } },
          { kind: "Field", name: { kind: "Name", value: "minimumWords" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AssessmentAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AssessmentAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "taskId" } },
          { kind: "Field", name: { kind: "Name", value: "skill" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "task" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AssessmentTaskFields" },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "answerText" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "report" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "wordCount" } },
          { kind: "Field", name: { kind: "Name", value: "version" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          { kind: "Field", name: { kind: "Name", value: "learnerId" } },
          { kind: "Field", name: { kind: "Name", value: "learnerName" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentGradeMutation,
  AssessmentGradeMutationVariables
>;
export const AssessmentNotificationsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AssessmentNotifications" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assessmentNotifications" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attemptId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "skill" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "version" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "assessedAt" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentNotificationsQuery,
  AssessmentNotificationsQueryVariables
>;
export const AssessmentReadResultDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AssessmentReadResult" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "version" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "readAssessmentResult" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "version" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssessmentReadResultMutation,
  AssessmentReadResultMutationVariables
>;
export const AdminContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AdminContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ContentStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "ContentReviewFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminContentQuery, AdminContentQueryVariables>;
export const SubmitContentForReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitContentForReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitContentForReview" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitContentForReviewMutation,
  SubmitContentForReviewMutationVariables
>;
export const ApproveContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ApproveContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "approveContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ApproveContentMutation,
  ApproveContentMutationVariables
>;
export const RejectContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RejectContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rejectContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RejectContentMutation,
  RejectContentMutationVariables
>;
export const PublishContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PublishContentMutation,
  PublishContentMutationVariables
>;
export const RestoreContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RestoreContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "restoreContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RestoreContentMutation,
  RestoreContentMutationVariables
>;
export const ArchiveContentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ArchiveContent" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "kind" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentKind" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "archiveContent" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "kind" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "kind" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ContentReviewFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ContentReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ContentReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "itemCount" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ArchiveContentMutation,
  ArchiveContentMutationVariables
>;
export const DictationLessonsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DictationLessons" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "topic" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dictationLessons" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "topic" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "topic" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "DictationLessonFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DictationLessonFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "DictationLesson" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "sentenceCount" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completedSentenceCount" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "totalDurationSeconds" },
          },
          { kind: "Field", name: { kind: "Name", value: "lastPractisedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DictationLessonsQuery,
  DictationLessonsQueryVariables
>;
export const DictationLessonDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DictationLessonDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dictationLesson" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lesson" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "DictationLessonFields" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sentences" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "DictationSentenceFields",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DictationLessonFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "DictationLesson" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "sentenceCount" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completedSentenceCount" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "totalDurationSeconds" },
          },
          { kind: "Field", name: { kind: "Name", value: "lastPractisedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "DictationSentenceFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "DictationSentence" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "audioDurationSeconds" },
          },
          { kind: "Field", name: { kind: "Name", value: "hintWordCount" } },
          { kind: "Field", name: { kind: "Name", value: "hintFirstLetters" } },
          { kind: "Field", name: { kind: "Name", value: "hintRevealWord" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "hintPartialTranscript" },
          },
          { kind: "Field", name: { kind: "Name", value: "audioStartMs" } },
          { kind: "Field", name: { kind: "Name", value: "audioEndMs" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "bestAccuracyPercent" },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DictationLessonDetailQuery,
  DictationLessonDetailQueryVariables
>;
export const SubmitDictationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitDictation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "sentenceId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "response" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitDictation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "sentenceId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "sentenceId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "response" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "response" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sentenceId" } },
                { kind: "Field", name: { kind: "Name", value: "correctText" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "translationVi" },
                },
                { kind: "Field", name: { kind: "Name", value: "response" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "accuracyPercent" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "correctWordCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "totalWordCount" },
                },
                { kind: "Field", name: { kind: "Name", value: "cleared" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitDictationMutation,
  SubmitDictationMutationVariables
>;
export const DictationStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DictationStats" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "periodDays" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dictationStats" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "periodDays" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "periodDays" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "periodDays" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lessonsCompleted" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "averageAccuracyPercent" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "listeningSeconds" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sentencesPractised" },
                },
                { kind: "Field", name: { kind: "Name", value: "streakDays" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "day" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracyPercent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attemptCount" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "missedWords" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "word" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "missedCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "correctCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracyPercent" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "difficultSentences" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sentenceId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "text" } },
                      { kind: "Field", name: { kind: "Name", value: "topic" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracyPercent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attemptCount" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "history" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "day" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lessonId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lessonTitle" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sentenceCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracyPercent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "listeningSeconds" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DictationStatsQuery, DictationStatsQueryVariables>;
export const DictationMistakesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DictationMistakes" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dictationMistakes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "sentenceId" } },
                { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "audioDurationSeconds" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "audioStartMs" },
                },
                { kind: "Field", name: { kind: "Name", value: "audioEndMs" } },
                { kind: "Field", name: { kind: "Name", value: "lessonId" } },
                { kind: "Field", name: { kind: "Name", value: "lessonTitle" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "bestAccuracyPercent" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "attemptCount" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "lastResponse" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DictationMistakesQuery,
  DictationMistakesQueryVariables
>;
export const AdminExamsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AdminExams" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "status" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ExamStatus" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "examType" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ExamType" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "adminExams" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "status" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "status" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "examType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "examType" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AdminExamFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamListItem" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "examType" } },
          { kind: "Field", name: { kind: "Name", value: "certificateType" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateVariant" },
          },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "createdByUserId" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AdminExamsQuery, AdminExamsQueryVariables>;
export const PublishExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishExam" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "publishExam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PublishExamMutation, PublishExamMutationVariables>;
export const RestoreExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RestoreExam" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "restoreExam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RestoreExamMutation, RestoreExamMutationVariables>;
export const ArchiveExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ArchiveExam" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "archiveExam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ArchiveExamMutation, ArchiveExamMutationVariables>;
export const SubmitExamForReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitExamForReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitExamForReview" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitExamForReviewMutation,
  SubmitExamForReviewMutationVariables
>;
export const ApproveExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ApproveExam" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "approveExam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveExamMutation, ApproveExamMutationVariables>;
export const RejectExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RejectExam" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "note" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rejectExam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "note" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "note" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AdminExamShellFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AdminExamShellFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Exam" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "versionNumber" } },
          { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "submittedForReviewAt" },
          },
          { kind: "Field", name: { kind: "Name", value: "reviewedAt" } },
          { kind: "Field", name: { kind: "Name", value: "reviewNote" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectExamMutation, RejectExamMutationVariables>;
export const ExamDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "examDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "answers" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "questionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedOptionIds" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "savedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExamDraftQuery, ExamDraftQueryVariables>;
export const SaveExamDraftDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SaveExamDraft" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "version" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "answers" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "SubmitAnswerInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "saveExamDraft" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "version" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "answers" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "answers" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "answers" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "questionId" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "selectedOptionIds" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "savedAt" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SaveExamDraftMutation,
  SaveExamDraftMutationVariables
>;
export const StartExamAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartExamAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "examId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "StartExamAttemptInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startExamAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "examId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "examId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ExamAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExamAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "examId" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "scoredAt" } },
          { kind: "Field", name: { kind: "Name", value: "rawScore" } },
          { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
          { kind: "Field", name: { kind: "Name", value: "examTitle" } },
          { kind: "Field", name: { kind: "Name", value: "mode" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "parts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "sectionType" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  StartExamAttemptMutation,
  StartExamAttemptMutationVariables
>;
export const AttemptPaperDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AttemptPaper" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "attemptPaper" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "examType" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "certificateType" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "certificateVariant" },
                },
                { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "durationSeconds" },
                },
                { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
                { kind: "Field", name: { kind: "Name", value: "passScore" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "versionNumber" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sections" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "orderNo" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxRawScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scoredByCriteria" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "timeLimitSeconds" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "parts" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "orderNo" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "instruction" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "audioUrl" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "imageUrl" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "questionSets" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "title" },
                                  },
                                  {
                                    kind: "Field",
                                    name: {
                                      kind: "Name",
                                      value: "instruction",
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "orderNo" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "content" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "audioUrl" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "imageUrl" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "questions" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "questionType",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "content",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "difficultyLevel",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "skillType",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "questionCategory",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "orderNo",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "maxRawScore",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "options",
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "id",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "content",
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: {
                                                  kind: "Name",
                                                  value: "orderNo",
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AttemptPaperQuery, AttemptPaperQueryVariables>;
export const SubmitExamAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitExamAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "answers" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "SubmitAnswerInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitExamAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "answers" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "answers" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ExamAttemptFields" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "questions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AttemptReviewFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExamAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "examId" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "scoredAt" } },
          { kind: "Field", name: { kind: "Name", value: "rawScore" } },
          { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
          { kind: "Field", name: { kind: "Name", value: "examTitle" } },
          { kind: "Field", name: { kind: "Name", value: "mode" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "parts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "sectionType" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AttemptReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AttemptQuestionReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "questionId" } },
          { kind: "Field", name: { kind: "Name", value: "selectedOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correctOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correct" } },
          { kind: "Field", name: { kind: "Name", value: "awardedRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "explanation" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "options" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "optionId" } },
                { kind: "Field", name: { kind: "Name", value: "correct" } },
                { kind: "Field", name: { kind: "Name", value: "explanation" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitExamAttemptMutation,
  SubmitExamAttemptMutationVariables
>;
export const ExamAttemptResultDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamAttemptResult" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "examAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "ExamAttemptFields" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "questions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AttemptReviewFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExamAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "examId" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "scoredAt" } },
          { kind: "Field", name: { kind: "Name", value: "rawScore" } },
          { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
          { kind: "Field", name: { kind: "Name", value: "examTitle" } },
          { kind: "Field", name: { kind: "Name", value: "mode" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "parts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "sectionType" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AttemptReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "AttemptQuestionReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "questionId" } },
          { kind: "Field", name: { kind: "Name", value: "selectedOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correctOptionIds" } },
          { kind: "Field", name: { kind: "Name", value: "correct" } },
          { kind: "Field", name: { kind: "Name", value: "awardedRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "explanation" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "options" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "optionId" } },
                { kind: "Field", name: { kind: "Name", value: "correct" } },
                { kind: "Field", name: { kind: "Name", value: "explanation" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ExamAttemptResultQuery,
  ExamAttemptResultQueryVariables
>;
export const ExamAttemptHistoryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamAttemptHistory" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "examAttempts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "ExamAttemptFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ExamAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ExamAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "examId" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "scoredAt" } },
          { kind: "Field", name: { kind: "Name", value: "rawScore" } },
          { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
          { kind: "Field", name: { kind: "Name", value: "examTitle" } },
          { kind: "Field", name: { kind: "Name", value: "mode" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "parts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "sectionType" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ExamAttemptHistoryQuery,
  ExamAttemptHistoryQueryVariables
>;
export const ExamLibraryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamLibrary" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "examType" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "ExamType" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "certificateType" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "CertificateType" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "certificateVariant" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "CertificateVariant" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "targetLevel" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "TargetLevel" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "exams" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "examType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "examType" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "certificateType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "certificateType" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "certificateVariant" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "certificateVariant" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "targetLevel" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "targetLevel" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "examType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "certificateType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "certificateVariant" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetLevel" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "durationSeconds" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "maxRawScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "passScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "questionCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "publishedAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "bestScorePercentage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "attemptStatus" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExamLibraryQuery, ExamLibraryQueryVariables>;
export const ExamDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "exam" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "examType" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "certificateType" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "certificateVariant" },
                },
                { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "durationSeconds" },
                },
                { kind: "Field", name: { kind: "Name", value: "maxRawScore" } },
                { kind: "Field", name: { kind: "Name", value: "passScore" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "questionCount" },
                },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "publishedAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "bestScorePercentage" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "attemptStatus" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExamDetailQuery, ExamDetailQueryVariables>;
export const PlacementExamDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PlacementExam" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "placementExam" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "durationSeconds" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "questionCount" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlacementExamQuery, PlacementExamQueryVariables>;
export const ExamOutlineDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ExamOutline" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "examId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "examOutline" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "examId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "examId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "examId" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sections" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sectionType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "orderNo" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "parts" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "orderNo" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "title" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "questionCount" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExamOutlineQuery, ExamOutlineQueryVariables>;
export const FlashcardSetsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FlashcardSets" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "topic" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "flashcardSets" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "topic" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "topic" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "FlashcardSetFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardSetFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "FlashcardSet" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "cardCount" } },
          { kind: "Field", name: { kind: "Name", value: "dueCount" } },
          { kind: "Field", name: { kind: "Name", value: "masteredCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastStudiedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FlashcardSetsQuery, FlashcardSetsQueryVariables>;
export const FlashcardSetDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FlashcardSetDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "flashcardSet" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "set" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "FlashcardSetFields" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cards" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "FlashcardFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardSetFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "FlashcardSet" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "topic" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "cardCount" } },
          { kind: "Field", name: { kind: "Name", value: "dueCount" } },
          { kind: "Field", name: { kind: "Name", value: "masteredCount" } },
          { kind: "Field", name: { kind: "Name", value: "lastStudiedAt" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Flashcard" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "lemma" } },
          { kind: "Field", name: { kind: "Name", value: "partOfSpeech" } },
          { kind: "Field", name: { kind: "Name", value: "senseLabel" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUs" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUk" } },
          { kind: "Field", name: { kind: "Name", value: "audioUsUrl" } },
          { kind: "Field", name: { kind: "Name", value: "audioUkUrl" } },
          { kind: "Field", name: { kind: "Name", value: "definitionEn" } },
          { kind: "Field", name: { kind: "Name", value: "definitionVi" } },
          { kind: "Field", name: { kind: "Name", value: "exampleSentence" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "exampleTranslationVi" },
          },
          { kind: "Field", name: { kind: "Name", value: "mnemonicTipVi" } },
          { kind: "Field", name: { kind: "Name", value: "cefrLevel" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "dueAt" } },
          { kind: "Field", name: { kind: "Name", value: "lapseCount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  FlashcardSetDetailQuery,
  FlashcardSetDetailQueryVariables
>;
export const FlashcardStudyQueueDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FlashcardStudyQueue" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "setId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "flashcardStudyQueue" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "setId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "setId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "FlashcardFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "FlashcardFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Flashcard" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "orderNo" } },
          { kind: "Field", name: { kind: "Name", value: "lemma" } },
          { kind: "Field", name: { kind: "Name", value: "partOfSpeech" } },
          { kind: "Field", name: { kind: "Name", value: "senseLabel" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUs" } },
          { kind: "Field", name: { kind: "Name", value: "ipaUk" } },
          { kind: "Field", name: { kind: "Name", value: "audioUsUrl" } },
          { kind: "Field", name: { kind: "Name", value: "audioUkUrl" } },
          { kind: "Field", name: { kind: "Name", value: "definitionEn" } },
          { kind: "Field", name: { kind: "Name", value: "definitionVi" } },
          { kind: "Field", name: { kind: "Name", value: "exampleSentence" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "exampleTranslationVi" },
          },
          { kind: "Field", name: { kind: "Name", value: "mnemonicTipVi" } },
          { kind: "Field", name: { kind: "Name", value: "cefrLevel" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "dueAt" } },
          { kind: "Field", name: { kind: "Name", value: "lapseCount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  FlashcardStudyQueueQuery,
  FlashcardStudyQueueQueryVariables
>;
export const RateFlashcardDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RateFlashcard" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "flashcardId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "rating" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ReviewRating" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "timeSpentSeconds" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "rateFlashcard" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "flashcardId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "flashcardId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "rating" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "rating" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "timeSpentSeconds" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "timeSpentSeconds" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "flashcardId" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "repetitions" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "intervalDays" },
                },
                { kind: "Field", name: { kind: "Name", value: "dueAt" } },
                { kind: "Field", name: { kind: "Name", value: "lapseCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RateFlashcardMutation,
  RateFlashcardMutationVariables
>;
export const FlashcardStatsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "FlashcardStats" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "periodDays" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "flashcardStats" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "periodDays" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "periodDays" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "periodDays" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cardsStudied" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "retentionPercent" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "studySeconds" },
                },
                { kind: "Field", name: { kind: "Name", value: "streakDays" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "day" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cardCount" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "difficultCards" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "flashcardId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "lemma" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "setName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lapseCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastReviewed" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "history" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "day" } },
                      { kind: "Field", name: { kind: "Name", value: "setId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "setName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "cardCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "recallPercent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "studySeconds" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FlashcardStatsQuery, FlashcardStatsQueryVariables>;
export const LearningPurposesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LearningPurposes" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "purposeCode" } },
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LearningPurposesQuery,
  LearningPurposesQueryVariables
>;
export const SelectLearningPurposesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SelectLearningPurposes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "purposeIds" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "Int" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "selectLearningPurposes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "purposeIds" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "purposeIds" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SelectLearningPurposesMutation,
  SelectLearningPurposesMutationVariables
>;
export const SetCertificateTargetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCertificateTarget" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "certificateType" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "TargetCertificate" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCertificateTarget" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "certificateType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "certificateType" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCertificateTargetMutation,
  SetCertificateTargetMutationVariables
>;
export const SetCurrentLevelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetCurrentLevel" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "level" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CefrLevel" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setCurrentLevel" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "level" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "level" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCurrentLevelMutation,
  SetCurrentLevelMutationVariables
>;
export const SetLearningGoalDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SetLearningGoal" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "LearningGoalInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "setLearningGoal" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetLearningGoalMutation,
  SetLearningGoalMutationVariables
>;
export const SelectTargetSkillsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SelectTargetSkills" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "skills" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "LearningSkill" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "selectTargetSkills" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "skills" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "skills" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SelectTargetSkillsMutation,
  SelectTargetSkillsMutationVariables
>;
export const CompleteOnboardingDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CompleteOnboarding" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "completeOnboarding" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "OnboardingStateFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "OnboardingStateFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "OnboardingState" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "step" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "learningPurposeIds" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "certificateLearner" },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "targetCertificateType" },
          },
          { kind: "Field", name: { kind: "Name", value: "currentLevel" } },
          { kind: "Field", name: { kind: "Name", value: "targetScore" } },
          { kind: "Field", name: { kind: "Name", value: "targetDate" } },
          { kind: "Field", name: { kind: "Name", value: "targetSkills" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CompleteOnboardingMutation,
  CompleteOnboardingMutationVariables
>;
export const SpeakingPromptsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SpeakingPrompts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "category" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "speakingPrompts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "category" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "category" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "SpeakingPromptFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingPromptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingPrompt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "ipaTranscript" } },
          { kind: "Field", name: { kind: "Name", value: "translationVi" } },
          { kind: "Field", name: { kind: "Name", value: "phonemeTarget" } },
          { kind: "Field", name: { kind: "Name", value: "tips" } },
          { kind: "Field", name: { kind: "Name", value: "bestScorePercent" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SpeakingPromptsQuery,
  SpeakingPromptsQueryVariables
>;
export const SpeakingPromptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SpeakingPrompt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "speakingPrompt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SpeakingPromptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingPromptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingPrompt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "ipaTranscript" } },
          { kind: "Field", name: { kind: "Name", value: "translationVi" } },
          { kind: "Field", name: { kind: "Name", value: "phonemeTarget" } },
          { kind: "Field", name: { kind: "Name", value: "tips" } },
          { kind: "Field", name: { kind: "Name", value: "bestScorePercent" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SpeakingPromptQuery, SpeakingPromptQueryVariables>;
export const SpeakingAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SpeakingAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "speakingAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SpeakingAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "speakingPromptId" } },
          { kind: "Field", name: { kind: "Name", value: "promptTitle" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "accuracyPercent" } },
          { kind: "Field", name: { kind: "Name", value: "fluencyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completenessPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "prosodyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "pronunciationPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "words" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "orderNo" } },
                { kind: "Field", name: { kind: "Name", value: "word" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "accuracyPercent" },
                },
                { kind: "Field", name: { kind: "Name", value: "errorType" } },
                { kind: "Field", name: { kind: "Name", value: "offsetMs" } },
                { kind: "Field", name: { kind: "Name", value: "durationMs" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "phonemes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "phoneme" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracy" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SpeakingAttemptQuery,
  SpeakingAttemptQueryVariables
>;
export const SpeakingAttemptsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SpeakingAttempts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "promptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "speakingAttempts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "promptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "promptId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SpeakingAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "speakingPromptId" } },
          { kind: "Field", name: { kind: "Name", value: "promptTitle" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "accuracyPercent" } },
          { kind: "Field", name: { kind: "Name", value: "fluencyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completenessPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "prosodyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "pronunciationPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "words" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "orderNo" } },
                { kind: "Field", name: { kind: "Name", value: "word" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "accuracyPercent" },
                },
                { kind: "Field", name: { kind: "Name", value: "errorType" } },
                { kind: "Field", name: { kind: "Name", value: "offsetMs" } },
                { kind: "Field", name: { kind: "Name", value: "durationMs" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "phonemes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "phoneme" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracy" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SpeakingAttemptsQuery,
  SpeakingAttemptsQueryVariables
>;
export const StartSpeakingAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartSpeakingAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "promptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "contentType" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "contentLength" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startSpeakingAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "promptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "promptId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentType" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "contentType" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "contentLength" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "contentLength" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "attemptId" } },
                { kind: "Field", name: { kind: "Name", value: "uploadUrl" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "expiresInSeconds" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  StartSpeakingAttemptMutation,
  StartSpeakingAttemptMutationVariables
>;
export const SubmitSpeakingAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitSpeakingAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitSpeakingAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "SpeakingAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "SpeakingAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "SpeakingAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "speakingPromptId" } },
          { kind: "Field", name: { kind: "Name", value: "promptTitle" } },
          { kind: "Field", name: { kind: "Name", value: "referenceText" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "audioUrl" } },
          { kind: "Field", name: { kind: "Name", value: "recognizedText" } },
          { kind: "Field", name: { kind: "Name", value: "accuracyPercent" } },
          { kind: "Field", name: { kind: "Name", value: "fluencyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "completenessPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "prosodyPercent" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "pronunciationPercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "errorCode" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "assessedAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "words" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "orderNo" } },
                { kind: "Field", name: { kind: "Name", value: "word" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "accuracyPercent" },
                },
                { kind: "Field", name: { kind: "Name", value: "errorType" } },
                { kind: "Field", name: { kind: "Name", value: "offsetMs" } },
                { kind: "Field", name: { kind: "Name", value: "durationMs" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "phonemes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "phoneme" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accuracy" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitSpeakingAttemptMutation,
  SubmitSpeakingAttemptMutationVariables
>;
export const DailyPathDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "DailyPath" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "dailyPath" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "streakDays" } },
                { kind: "Field", name: { kind: "Name", value: "totalXp" } },
                { kind: "Field", name: { kind: "Name", value: "level" } },
                { kind: "Field", name: { kind: "Name", value: "xpIntoLevel" } },
                { kind: "Field", name: { kind: "Name", value: "levelCostXp" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tasks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetId" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "order" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsRemaining" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "unitsDoneToday" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "completionPercent" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "xpReward" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "quests" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "kind" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "progress" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "target" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "completed" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DailyPathQuery, DailyPathQueryVariables>;
export const QuizzesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "Quizzes" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "category" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "title" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "size" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "quizzes" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "category" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "category" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "title" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "title" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "size" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "size" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "QuizFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "size" } },
                { kind: "Field", name: { kind: "Name", value: "totalItems" } },
                { kind: "Field", name: { kind: "Name", value: "totalPages" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Quiz" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "slug" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "category" } },
          { kind: "Field", name: { kind: "Name", value: "targetLevel" } },
          { kind: "Field", name: { kind: "Name", value: "timeLimitSeconds" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "passingScorePercent" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "bestScorePercent" } },
          { kind: "Field", name: { kind: "Name", value: "attemptCount" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QuizzesQuery, QuizzesQueryVariables>;
export const StartQuizAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "StartQuizAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "quizId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "startQuizAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "quizId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "quizId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "QuizAttemptFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "QuizAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "quizId" } },
          { kind: "Field", name: { kind: "Name", value: "quizTitle" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "score" } },
          { kind: "Field", name: { kind: "Name", value: "maxScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "passed" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  StartQuizAttemptMutation,
  StartQuizAttemptMutationVariables
>;
export const QuizPaperDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QuizPaper" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "quizPaper" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "attemptId" } },
                { kind: "Field", name: { kind: "Name", value: "quizId" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "timeLimitSeconds" },
                },
                { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "questions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "orderNo" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "questionType" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "prompt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "points" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "beforeText" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "afterText" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "originalSentence" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "rewriteKeyword" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "options" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "orderNo" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "label" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "wordBank" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "scrambledWords" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "leftTexts" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "rightTexts" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QuizPaperQuery, QuizPaperQueryVariables>;
export const SubmitQuizAttemptDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "SubmitQuizAttempt" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "attemptId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "answers" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "QuizAnswerInput" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "submitQuizAttempt" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "attemptId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "attemptId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "answers" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "answers" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "QuizAttemptFields" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reviews" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "QuizReviewFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizAttemptFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "QuizAttempt" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "quizId" } },
          { kind: "Field", name: { kind: "Name", value: "quizTitle" } },
          { kind: "Field", name: { kind: "Name", value: "status" } },
          { kind: "Field", name: { kind: "Name", value: "startedAt" } },
          { kind: "Field", name: { kind: "Name", value: "expiresAt" } },
          { kind: "Field", name: { kind: "Name", value: "submittedAt" } },
          { kind: "Field", name: { kind: "Name", value: "score" } },
          { kind: "Field", name: { kind: "Name", value: "maxScore" } },
          { kind: "Field", name: { kind: "Name", value: "scorePercentage" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "correctAnswerCount" },
          },
          { kind: "Field", name: { kind: "Name", value: "questionCount" } },
          { kind: "Field", name: { kind: "Name", value: "passed" } },
          { kind: "Field", name: { kind: "Name", value: "resumed" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "QuizReviewFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "QuizQuestionReview" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "questionId" } },
          { kind: "Field", name: { kind: "Name", value: "questionType" } },
          { kind: "Field", name: { kind: "Name", value: "prompt" } },
          { kind: "Field", name: { kind: "Name", value: "userAnswerText" } },
          { kind: "Field", name: { kind: "Name", value: "correctAnswerText" } },
          { kind: "Field", name: { kind: "Name", value: "correct" } },
          { kind: "Field", name: { kind: "Name", value: "pointsEarned" } },
          { kind: "Field", name: { kind: "Name", value: "pointsPossible" } },
          { kind: "Field", name: { kind: "Name", value: "explanation" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SubmitQuizAttemptMutation,
  SubmitQuizAttemptMutationVariables
>;
export const MyTourStatusDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MyTourStatus" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "myTourStatus" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "completed" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyTourStatusQuery, MyTourStatusQueryVariables>;
export const CompleteMyTourDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CompleteMyTour" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "completeMyTour" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "completed" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CompleteMyTourMutation,
  CompleteMyTourMutationVariables
>;
export const CurrentUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CurrentUser" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "fullName" } },
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
                { kind: "Field", name: { kind: "Name", value: "gender" } },
                { kind: "Field", name: { kind: "Name", value: "birthDate" } },
                { kind: "Field", name: { kind: "Name", value: "avatarUrl" } },
                { kind: "Field", name: { kind: "Name", value: "bannerUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "onboardingStep" },
                },
                { kind: "Field", name: { kind: "Name", value: "role" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "onboardingState" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "certificateLearner" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "currentLevel" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetCertificateType" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetScore" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetDate" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "targetSkills" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
