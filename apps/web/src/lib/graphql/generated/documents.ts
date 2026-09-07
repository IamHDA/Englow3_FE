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
      publishedAt: unknown;
      bestScore: number | null;
      attemptStatus: string | null;
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

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  me: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    onboardingStep: Types.OnboardingStep;
  };
};

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
                { kind: "Field", name: { kind: "Name", value: "displayName" } },
                { kind: "Field", name: { kind: "Name", value: "avatarUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "onboardingStep" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
