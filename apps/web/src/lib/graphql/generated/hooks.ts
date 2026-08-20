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
  >(LearningPurposesDocument, options);
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
export const CurrentUserDocument = gql`
  query CurrentUser {
    me {
      id
      displayName
      avatarUrl
      onboardingStep
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
  >(CurrentUserDocument, options);
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
