# GraphQL and provider integration

## Contents

1. Decision rule
2. GraphQL operations and codegen
3. Fragments
4. Partial data
5. Errors
6. Authentication
7. Uploads
8. Async AI work
9. Third-party calls

## Decision rule

Go through the BFF when a call requires a secret or permanent credential, changes business state, needs server-side authorization or validation, costs money or needs rate limiting, needs idempotency or auditing, or touches private application data.

Call a third party directly from the browser only when its SDK or endpoint is explicitly browser-safe and uses public configuration, an end-user session token, a pre-signed URL, or a short-lived scoped token.

Cross-Origin Resource Sharing is not a security boundary. A provider accepting browser requests is not a reason to expose a secret.

## GraphQL operations and codegen

The BFF exposes one GraphQL endpoint. There is no per-endpoint client function and no BFF base path in feature code.

Operations live as documents in `src/features/<feature>/graphql/`, next to the components that use them. Codegen collects them all and produces typed hooks and result types under `src/lib/graphql/generated`. Run codegen after every schema or document change, and commit its output so type errors surface in review rather than at runtime.

```graphql
# src/features/exam/graphql/exam-detail.graphql
query ExamDetail($id: ID!) {
  exam(id: $id) {
    ...ExamDetailFields
  }
}
```

```tsx
"use client";
import { useExamDetailQuery } from "@/lib/graphql/generated";

<<<<<<< Updated upstream
export function ExamDetail({ examId }: { examId: string }) {
=======
export function ExamDetailView({ examId }: { examId: string }) {
>>>>>>> Stashed changes
  const { data, loading, error } = useExamDetailQuery({ variables: { id: examId } });
  ...
}
```

<<<<<<< Updated upstream
Never hand-write a type for a GraphQL response, and never call the BFF with `fetch`. If a type feels missing, the schema or the document is missing a field.

For Server Components, query through the server-side Apollo client rather than a hook. `useSuspenseQuery` is the client-side counterpart when the component should participate in a Suspense boundary.
=======
This is the client-side shape. Fetching belongs to a view - never a block - so name it accordingly; a component fetching under a bare feature-noun name is easy to mistake for a block later. For a Server Component view, query through the server-side Apollo client instead of this hook.

Never hand-write a type for a GraphQL response, and never call the BFF with `fetch`. If a type feels missing, the schema or the document is missing a field.

`useSuspenseQuery` is the client-side counterpart when a view should participate in a Suspense boundary.
>>>>>>> Stashed changes

## Fragments

Fragments are the unit of composition, and they map onto the component tree. A component declares the fields it needs; the page composes those fragments into one operation.

```graphql
# src/features/exam/graphql/exam-card.graphql
fragment ExamCardFields on Exam {
  id
  title
  status
  questionCount
}
```

```graphql
query ExamList($page: Int) {
  exams(page: $page) {
    items { ...ExamCardFields }
  }
}
```

This keeps data requirements next to the component that renders them, so a component gaining a field does not mean hunting through pages to add it. Do not over-fetch "just in case" - each field costs a backend call somewhere behind the BFF.

## Partial data

The BFF deliberately makes some fields nullable so one failing backend call degrades a panel instead of blanking the screen. GraphQL returns `data` and `errors` together, so the frontend must handle both.

```tsx
const { data, error } = useDashboardQuery();

// data may be present even when error is set
if (!data) return <DashboardSkeleton />;

return (
  <>
    <ProfilePanel profile={data.dashboard.profile} />
    {data.dashboard.progress
      ? <ProgressPanel progress={data.dashboard.progress} />
      : <PanelUnavailable label="Progress" />}
  </>
);
```

Treating any `error` as total failure throws away the design. A null on a nullable field means that panel is unavailable, not that the page failed. Use Apollo's `errorPolicy: "all"` so partial results are delivered rather than discarded.

Non-null fields behave the opposite way: if one fails, the query fails, and that is intended for content the screen cannot render without.

## Errors

GraphQL returns HTTP 200 with an `errors` array. The code lives in `extensions.code`, and the BFF passes a request identifier through.

```ts
const code = error?.graphQLErrors[0]?.extensions?.code;
```

Expected codes: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`, `BACKEND_UNAVAILABLE`, `INTERNAL_SERVER_ERROR`.

Map them to UI outcomes deliberately: `UNAUTHENTICATED` refreshes or redirects; `BAD_USER_INPUT` maps to form fields; `CONFLICT` shows a form-level message; the rest show a retryable or terminal error. Never render a raw error message from the server, and never surface the request identifier as the whole message - show it as a small reference the user can quote.

Network failures arrive separately as `networkError`, and the distinction matters: retry is reasonable there, and usually not for a GraphQL error.

## Authentication

```text
Browser -> auth provider: sign in
Auth provider -> Browser: session and access token
Browser -> BFF: Bearer token on every operation
BFF: verify token, forward to backend, backend authorizes
```

Attach the token in an Apollo link, once, not per operation. Let the auth SDK own the session - never persist tokens in a custom store, never log them, never place them in a GraphQL variable.

Hiding a button is not authorization. Every protected action is authorized on the server regardless of what the UI shows.

## Uploads

```text
Browser -> BFF: request upload authorization
BFF -> Browser: short-lived pre-signed URL and object key
Browser -> object storage: upload bytes directly
Browser -> BFF: submit the business record referencing the object key
BFF: verify the expected object and persist
```

Validate type and size before requesting the URL. A successful upload alone must never create trusted business state - the submit step does.

Upload progress is a determinate progress indicator, not a skeleton.

## Async AI work

Speaking analysis, essay grading, and exam generation run as backend jobs. The mutation returns a record with a status, not a result.

```text
Browser -> BFF: submit
BFF -> backend: create job, return PENDING record
Browser -> BFF: poll the record until the status is terminal
```

The frontend polls until `COMPLETED` or `FAILED`, and must stop on both. Polling forever because the schema has no failure state is the common bug here.

Use a skeleton for the result area while pending, and show elapsed time or a message once it exceeds the expected duration, so a slow job does not look like a frozen page.

## Third-party calls

Browser-safe integrations live under `src/lib/<provider>`. Suitable: the auth provider's browser SDK, an analytics SDK with a public key, an object-storage upload using a BFF-issued pre-signed URL, a realtime session using a BFF-issued ephemeral token.

Not suitable from the browser: AI providers with permanent keys, object storage with access and secret keys, email, payment, or administrative APIs.

Keep provider response shapes inside the provider module and map them into application types before the UI sees them.
