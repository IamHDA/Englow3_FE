/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schemaTypes';

import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
const defaultOptions = {} as const;
export type UpdateProfileMutationVariables = Exact<{
  input: Types.UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, email: string, fullName: string, displayName: string, gender: Types.Gender | null, birthDate: unknown, avatarUrl: string | null, bannerUrl: string | null, onboardingStep: Types.OnboardingStep, onboardingState: { currentLevel: Types.CefrLevel | null, targetCertificateType: string | null, targetScore: number | null, targetDate: unknown, targetSkills: Array<Types.LearningSkill> } | null } };

export type ExamLibraryQueryVariables = Exact<{
  examType?: Types.ExamType | null | undefined;
  certificateType?: Types.CertificateType | null | undefined;
  certificateVariant?: Types.CertificateVariant | null | undefined;
  targetLevel?: Types.TargetLevel | null | undefined;
  title?: string | null | undefined;
  page?: number | null | undefined;
  size?: number | null | undefined;
}>;


export type ExamLibraryQuery = { exams: { page: number, size: number, totalItems: number, totalPages: number, items: Array<{ id: string, title: string, description: string, examType: Types.ExamType, certificateType: Types.CertificateType | null, certificateVariant: Types.CertificateVariant | null, targetLevel: Types.TargetLevel | null, durationSeconds: number, maxRawScore: number, passScore: number | null, questionCount: number, status: Types.ExamStatus, publishedAt: unknown, bestScore: number | null, attemptStatus: string | null }> } };

export type ExamDetailQueryVariables = Exact<{
  id: string | number;
}>;


export type ExamDetailQuery = { exam: { id: string, title: string, description: string, examType: Types.ExamType, certificateType: Types.CertificateType | null, certificateVariant: Types.CertificateVariant | null, targetLevel: Types.TargetLevel | null, durationSeconds: number, maxRawScore: number, passScore: number | null, questionCount: number, status: Types.ExamStatus, publishedAt: unknown, bestScore: number | null, attemptStatus: string | null } | null };

export type ExamPaperQueryVariables = Exact<{
  id: string | number;
}>;


export type ExamPaperQuery = { examPaper: { id: string, title: string, description: string, examType: Types.ExamType, certificateType: Types.CertificateType | null, certificateVariant: Types.CertificateVariant | null, targetLevel: Types.TargetLevel | null, durationSeconds: number, maxRawScore: number, passScore: number | null, status: Types.ExamStatus, versionNumber: number, sections: Array<{ id: string, sectionType: string, orderNo: number, maxRawScore: number, scoredByCriteria: boolean, timeLimitSeconds: number | null, parts: Array<{ id: string, orderNo: number, title: string, instruction: string | null, content: string | null, audioObjectKey: string | null, imageObjectKey: string | null, questionSets: Array<{ id: string, title: string | null, instruction: string | null, orderNo: number, content: string | null, audioObjectKey: string | null, imageObjectKey: string | null, questions: Array<{ id: string, questionType: string, content: string, difficultyLevel: string, skillType: string, questionCategory: string | null, orderNo: number, maxRawScore: number, explanation: string | null, options: Array<{ id: string, content: string, orderNo: number, correct: boolean, explanation: string | null }> }> }> }> }> } | null };

export type LearningPurposesQueryVariables = Exact<{ [key: string]: never; }>;


export type LearningPurposesQuery = { learningPurposes: Array<{ id: number, purposeCode: string, displayName: string }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { me: { id: string, email: string, fullName: string, displayName: string, gender: Types.Gender | null, birthDate: unknown, avatarUrl: string | null, bannerUrl: string | null, onboardingStep: Types.OnboardingStep, onboardingState: { currentLevel: Types.CefrLevel | null, targetCertificateType: string | null, targetScore: number | null, targetDate: unknown, targetSkills: Array<Types.LearningSkill> } | null } };


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
      currentLevel
      targetCertificateType
      targetScore
      targetDate
      targetSkills
    }
  }
}
    `;
export type UpdateProfileMutationFn = (options?: ApolloReactCommon.MutationFunctionOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) => Promise<any>;

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
export function useUpdateProfileMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = ApolloReactCommon.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = ApolloReactCommon.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ExamLibraryDocument = gql`
    query ExamLibrary($examType: ExamType, $certificateType: CertificateType, $certificateVariant: CertificateVariant, $targetLevel: TargetLevel, $title: String, $page: Int, $size: Int) {
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
      bestScore
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
export function useExamLibraryQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ExamLibraryQuery, ExamLibraryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ExamLibraryQuery, ExamLibraryQueryVariables>(ExamLibraryDocument, options);
      }
export function useExamLibraryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ExamLibraryQuery, ExamLibraryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ExamLibraryQuery, ExamLibraryQueryVariables>(ExamLibraryDocument, options);
        }
export function useExamLibrarySuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ExamLibraryQuery, ExamLibraryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamLibraryQuery, ExamLibraryQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamLibrarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamLibraryQuery, ExamLibraryQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamLibraryQuery | undefined, ExamLibraryQueryVariables>;
export function useExamLibrarySuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamLibraryQuery, ExamLibraryQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ExamLibraryQuery, ExamLibraryQueryVariables>(ExamLibraryDocument, options as any);
        }
export type ExamLibraryQueryHookResult = ReturnType<typeof useExamLibraryQuery>;
export type ExamLibraryLazyQueryHookResult = ReturnType<typeof useExamLibraryLazyQuery>;
export type ExamLibrarySuspenseQueryHookResult = ReturnType<typeof useExamLibrarySuspenseQuery>;
export type ExamLibraryQueryResult = ApolloReactCommon.QueryResult<ExamLibraryQuery, ExamLibraryQueryVariables>;
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
    bestScore
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
export function useExamDetailQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ExamDetailQuery, ExamDetailQueryVariables> & ({ variables: ExamDetailQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ExamDetailQuery, ExamDetailQueryVariables>(ExamDetailDocument, options);
      }
export function useExamDetailLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ExamDetailQuery, ExamDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ExamDetailQuery, ExamDetailQueryVariables>(ExamDetailDocument, options);
        }
export function useExamDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ExamDetailQuery, ExamDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamDetailQuery, ExamDetailQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamDetailQuery, ExamDetailQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamDetailQuery | undefined, ExamDetailQueryVariables>;
export function useExamDetailSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamDetailQuery, ExamDetailQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ExamDetailQuery, ExamDetailQueryVariables>(ExamDetailDocument, options as any);
        }
export type ExamDetailQueryHookResult = ReturnType<typeof useExamDetailQuery>;
export type ExamDetailLazyQueryHookResult = ReturnType<typeof useExamDetailLazyQuery>;
export type ExamDetailSuspenseQueryHookResult = ReturnType<typeof useExamDetailSuspenseQuery>;
export type ExamDetailQueryResult = ApolloReactCommon.QueryResult<ExamDetailQuery, ExamDetailQueryVariables>;
export const ExamPaperDocument = gql`
    query ExamPaper($id: ID!) {
  examPaper(id: $id) {
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
    status
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
        audioObjectKey
        imageObjectKey
        questionSets {
          id
          title
          instruction
          orderNo
          content
          audioObjectKey
          imageObjectKey
          questions {
            id
            questionType
            content
            difficultyLevel
            skillType
            questionCategory
            orderNo
            maxRawScore
            explanation
            options {
              id
              content
              orderNo
              correct
              explanation
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useExamPaperQuery__
 *
 * To run a query within a React component, call `useExamPaperQuery` and pass it any options that fit your needs.
 * When your component renders, `useExamPaperQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExamPaperQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useExamPaperQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ExamPaperQuery, ExamPaperQueryVariables> & ({ variables: ExamPaperQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ExamPaperQuery, ExamPaperQueryVariables>(ExamPaperDocument, options);
      }
export function useExamPaperLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ExamPaperQuery, ExamPaperQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ExamPaperQuery, ExamPaperQueryVariables>(ExamPaperDocument, options);
        }
export function useExamPaperSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<ExamPaperQuery, ExamPaperQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamPaperQuery, ExamPaperQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useExamPaperSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamPaperQuery, ExamPaperQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<ExamPaperQuery | undefined, ExamPaperQueryVariables>;
export function useExamPaperSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<ExamPaperQuery, ExamPaperQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<ExamPaperQuery, ExamPaperQueryVariables>(ExamPaperDocument, options as any);
        }
export type ExamPaperQueryHookResult = ReturnType<typeof useExamPaperQuery>;
export type ExamPaperLazyQueryHookResult = ReturnType<typeof useExamPaperLazyQuery>;
export type ExamPaperSuspenseQueryHookResult = ReturnType<typeof useExamPaperSuspenseQuery>;
export type ExamPaperQueryResult = ApolloReactCommon.QueryResult<ExamPaperQuery, ExamPaperQueryVariables>;
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
export function useLearningPurposesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<LearningPurposesQuery, LearningPurposesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<LearningPurposesQuery, LearningPurposesQueryVariables>(LearningPurposesDocument, options);
      }
export function useLearningPurposesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<LearningPurposesQuery, LearningPurposesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<LearningPurposesQuery, LearningPurposesQueryVariables>(LearningPurposesDocument, options);
        }
export function useLearningPurposesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<LearningPurposesQuery, LearningPurposesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<LearningPurposesQuery, LearningPurposesQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useLearningPurposesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<LearningPurposesQuery, LearningPurposesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<LearningPurposesQuery | undefined, LearningPurposesQueryVariables>;
export function useLearningPurposesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<LearningPurposesQuery, LearningPurposesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<LearningPurposesQuery, LearningPurposesQueryVariables>(LearningPurposesDocument, options as any);
        }
export type LearningPurposesQueryHookResult = ReturnType<typeof useLearningPurposesQuery>;
export type LearningPurposesLazyQueryHookResult = ReturnType<typeof useLearningPurposesLazyQuery>;
export type LearningPurposesSuspenseQueryHookResult = ReturnType<typeof useLearningPurposesSuspenseQuery>;
export type LearningPurposesQueryResult = ApolloReactCommon.QueryResult<LearningPurposesQuery, LearningPurposesQueryVariables>;
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
    onboardingState {
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
export function useCurrentUserQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export function useCurrentUserSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
// @ts-expect-error - see scripts/fixSuspenseOverload.mjs
export function useCurrentUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<CurrentUserQuery | undefined, CurrentUserQueryVariables>;
export function useCurrentUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options as any);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = ApolloReactCommon.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;