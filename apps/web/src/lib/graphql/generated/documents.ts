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
      certificateLearner: boolean | null;
      currentLevel: Types.CefrLevel | null;
      targetCertificateType: string | null;
      targetScore: number | null;
      targetDate: string | null;
      targetSkills: Array<Types.LearningSkill>;
    } | null;
  };
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
    }>;
  };
};

export type AdminExamShellFieldsFragment = {
  id: string;
  title: string;
  status: Types.ExamStatus;
  versionNumber: number;
  publishedAt: string | null;
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
      bestScore: number | null;
      attemptStatus: string | null;
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
    bestScore: number | null;
    attemptStatus: string | null;
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<PublishExamMutation, PublishExamMutationVariables>;
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<ArchiveExamMutation, ArchiveExamMutationVariables>;
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
                        name: { kind: "Name", value: "bestScore" },
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
                { kind: "Field", name: { kind: "Name", value: "bestScore" } },
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
