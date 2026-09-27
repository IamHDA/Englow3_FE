# Implementation Patterns

Skeletons, not templates. Match the conventions already in the repository over the shapes here.

## Contents

1. Recording the backend contract
2. typeDefs
3. Resolvers
4. API client
5. Backend HTTP client
6. Context
7. Mapper
8. DataLoader
9. Aggregate query with degradation
10. Async work
11. Error mapping
12. Tests

## Recording the backend contract

The module's REST types are **derived from the generated OpenAPI types**, not hand-declared. `apps/bff/src/generated/backend-openapi.ts` is `openapi-typescript`'s output from the backend's own `/v3/api-docs` (regenerate with `pnpm --filter bff run generate:backend` if it looks stale); everything else depends on the derived type, so a real backend change breaks compilation in one place instead of drifting silently.

```typescript
// exam.types.ts - mirrors GET /api/admin/exams/{id} exactly as the backend returns it
import type { paths } from "../../generated/backend-openapi.js";

export type ExamResponse =
  paths["/api/admin/exams"]["post"]["responses"][201]["content"]["application/json"];

export type ExamPageResponse =
  paths["/api/admin/exams"]["get"]["responses"][200]["content"]["application/json"];
export type ExamListItemResponse = ExamPageResponse["items"][number];
```

Read `paths["/api/..."]["method"]`, never the shorter `operations[...]` - Springdoc collides `operationId` across the admin controllers, so `operations[...]` keys are ambiguous suffixes (`_1".."_5`) rather than stable names.

Override only where the generated type is under-typed - Springdoc renders a `@JsonRawValue` field or a computed value as plain `string` when the real value is a fixed set:

```typescript
// attemptStatus is `String` on the backend (a computed value, not the Java
// enum), so OpenAPI can only say `string`. Reasserted as what it actually is.
export type LearnerExamItemResponse = Omit<
  RawLearnerExamItemResponse,
  "attemptStatus"
> & {
  attemptStatus: LearnerAttemptStatus;
};
```

Do not rename fields here to be prettier - this file is a record of reality; renaming belongs in the mapper. Do not hand-write a type the generator already produces; a hand-written literal silently stops tracking the backend the moment it drifts, which is the exact failure this convention exists to avoid.

## typeDefs

The schema serves the screen, not the backend. It may rename, omit, and add display fields.

```typescript
export const examTypeDefs = /* GraphQL */ `
  enum ExamStatus { DRAFT PENDING_REVIEW PUBLISHED ARCHIVED }

  type Exam {
    id: ID!
    title: String!
    status: ExamStatus!
    questionCount: Int!
    publishedAt: DateTime          # nullable - mirrors the backend
    creator: Learner               # nullable - resolved separately, may fail
  }

  type ExamPage {
    items: [Exam!]!
    page: Int!
    size: Int!
    totalElements: Int!
  }

  type Query {
    exam(id: ID!): Exam!
    exams(page: Int = 0, size: Int = 20): ExamPage!
  }
`;
```

The `/* GraphQL */` tag, not `#graphql` - that's the convention every module here actually uses (`.prettierignore` excludes these files from formatting because Prettier reflows this tag's contents; it leaves `#graphql`-tagged ones alone, which is the opposite of what you'd guess).

Use the `Date`/`DateTime` scalars rather than `String` for timestamps - both do real runtime validation (`graphql/scalars.ts`): `Date` rejects calendar dates that don't exist, `DateTime` requires a trailing `Z` and rejects a bare or offset timestamp. A malformed value throws at serialize/parse time rather than reaching the frontend as an opaque wrong string.

Nullability is a decision, not a default. A field that can fail independently, or that the backend can return as null, is nullable; everything else is not.

Resolvers for this schema come from `pnpm --filter bff run codegen` (`graphql-codegen`, config in `apps/bff/codegen.ts`), which reads every `*.typeDefs.ts` and emits a `Resolvers` type into `generated/graphql.ts` - see Resolvers below. Re-run it after changing a schema; a stale generated file makes a resolver typecheck against a shape the schema no longer has.

## Resolvers

Thin: read args, check auth, call, return (map only if the shape actually differs). No branching on domain state.

Typed via the generated `Resolvers` type, not by hand - `satisfies Resolvers` gets every resolver's `(parent, args, ctx)` checked against the real schema and the real `GraphQLContext`, so there is no per-arg annotation to write or to get wrong:

```typescript
import type { Resolvers } from "../../generated/graphql.js";

export const examResolvers = {
  Query: {
    exam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.getByIdAsLearner(args.id);
    },
  },

  Mutation: {
    publishExam: (_, args, ctx) => {
      ctx.requireToken();
      return ctx.apis.examApi.publishAsAdmin(args.id);
    },
  },
} satisfies Resolvers;
```

Returning the API response directly, with no mapper, is the common case here - most REST responses already match their GraphQL shape once enums are typed as the same string unions on both sides. Reach for a mapper (below) only once a field actually needs renaming, combining, or a presentation-only value the backend doesn't send.

Never do this - it duplicates a backend rule, and the two copies will drift:

```typescript
if (exam.questionCount === 0) {
  throw new Error("Exam cannot be published"); // wrong layer
}
```

`ctx.requireToken()` fails a caller with no token at all. It is not an authorization check, and not even a validity check on the token it does find - it doesn't verify the JWT (see Context below) - the backend still decides whether this user may publish.

## API client

One client per module, wrapping that module's endpoints. Return types come from `*.types.ts`.

```typescript
export class ExamApi {
  constructor(private readonly client: BackendClient) {}

  getByIdAsLearner(id: string): Promise<ExamResponse> {
    return this.client.get(`/api/exams/${encodeURIComponent(id)}`);
  }

  publishAsAdmin(id: string): Promise<ExamResponse> {
    return this.client.post(`/api/admin/exams/${encodeURIComponent(id)}/publish`);
  }
}
```

Encode path segments. An unescaped identifier in a template string is a path-traversal opening.

## Backend HTTP client

One shared client (`shared/http/backendClient.ts`): base URL, timeout, auth header, request id, JSON parsing, error translation. `get`/`post`/`put`/`delete` cover the JSON case; `send` is the one escape hatch for a caller (e.g. the REST import route) that needs the raw `Response` - a generated batch upload, say - rather than a parsed body.

```typescript
export class BackendClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly token?: string,
    private readonly requestId?: string,
  ) {}

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const start = Date.now();
    const response = await this.send(method, path, body); // throws on unreachable
    if (!response.ok) {
      throw await BackendError.fromResponse(response, method, path, Date.now() - start);
    }
    return (await response.json()) as T;
  }

  // send(): builds the request, sets headers, and is the one place that
  // distinguishes "never reached the backend" (throws, status 0) from
  // "backend answered" (returns the Response, even a 4xx/5xx one).
}
```

One instance per request, built by `createBackendClient(req.headers)` (`shared/http/backendClient.ts`), which also decides the request id: an incoming `x-request-id` is reused only if it's a well-formed UUID (so a trace started upstream keeps its id end to end), otherwise a fresh one is minted with `randomUUID()` - never an arbitrary client-supplied string.

Configuration comes from `env.backendUrl` / `env.backendTimeoutMs` - the validated, camelCase object from `config/env.ts` (phase-10 fail-fast validation), never a raw `process.env.BACKEND_URL` read from inside a module.

Never log the token, the authorization header, or media payloads.

## Context

Built per request (`graphql/context.ts`). Everything token-scoped lives here and nowhere else.

```typescript
export async function createContext({ req, res }): Promise<GraphQLContext> {
  const { token, requestId, client } = createBackendClient(req.headers);
  res.setHeader("x-request-id", requestId); // so a caller can read back its trace id

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
      examApi: new ExamApi(client),
      // ...one entry per module
    },
  };
}
```

There is no `currentUser` and no JWKS cache to keep warm - the BFF does not verify the token (see Authentication in architecture-rules.md), so there is nothing here to authenticate against, only a presence check. Adding a client to `apis` means adding one line here and updating every test that builds a context literal (see Tests).

## Mapper

Only when the GraphQL model differs. If it matches, return the response directly - a mapper that copies fields one to one is a file to keep in sync for no benefit. No module in this repo has needed one yet: every current REST response already lines up with its GraphQL shape once enums are typed as the same string unions on both sides (`enumsAsTypes: true` in `codegen.ts` - see typeDefs above). Treat this pattern as ready for the day one is needed, not as an existing example to copy from.

```typescript
export const mapExam = (r: ExamApiResponse): Exam => ({
  id: r.id,
  title: r.title,
  status: r.status,
  questionCount: r.questionCount,
  publishedAt: r.publishedAt,
  creatorId: r.creatorId, // for the creator field resolver
  displayTitle: `${r.title} (${r.questionCount})`, // presentation only
});
```

Presentation transformations belong here. Anything that decides a business outcome does not.

## DataLoader

Only after a real N+1. No loader exists in this repo yet - every list-with-detail case so far has had a batch endpoint to call directly instead. A field resolver that fires one call per parent row over a list is the case a loader is for:

```typescript
export const createLearnerLoader = (client: BackendClient) =>
  new DataLoader<string, LearnerApiResponse | null>(async (ids) => {
    const learners = await client.post<LearnerApiResponse[]>(
      "/api/learners/batch",
      { ids: [...ids] },
    );
    const byId = new Map(learners.map((l) => [l.id, l]));
    return ids.map((id) => byId.get(id) ?? null); // same order, same length
  });
```

```typescript
export const examFieldResolvers = {
  Exam: {
    creator: (exam: { creatorId: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.learnerLoader.load(exam.creatorId),
  },
};
```

Requirements, all of them load-bearing:

- A new loader per request. A shared one serves one user's data to another.
- Return in the same order as the keys, with the same length. A missing key is `null`, not a shortened array.
- A batch endpoint must exist on the backend. If it does not, that is a backend change to request - not something to work around by looping.

## Aggregate query with degradation

Decide per field what happens when one call fails, and express it as nullability.

**The pattern actually used here** is simpler than fanning out inside one resolver: put the optional data behind its own nullable field on the parent type, with its own resolver, and let a rejection propagate. `graphql-js` itself nulls a nullable field and appends an entry to the response's `errors` array when that field's resolver throws or rejects - it does not fail sibling fields. This is exactly what `onboarding.resolvers.ts` does for `Me.onboardingState`:

```typescript
export const onboardingResolvers = {
  // ...Query, Mutation...
  Me: {
    // Nullable in the schema: if this call fails, graphql-js resolves the
    // field to null and adds an entry to the `errors` array rather than
    // failing the whole `me` query - the rest of Me still renders.
    onboardingState: (_parent, __, ctx) => ctx.apis.onboardingApi.getCurrentState(),
  },
} satisfies Resolvers;
```

No `try`/`catch`, no `Promise.allSettled` - the degradation is free once the field is modeled as its own resolver on the parent type rather than as a property the parent's own resolver has to fill in.

Reach for `Promise.allSettled` instead only when several independent calls must combine into *one* payload that isn't naturally split into separate parent-type fields (a true single-object aggregate). No query in this repo has needed that yet, so treat the shape below as guidance for when it comes up, not as a pattern already proven here:

```typescript
const [progress, profile] = await Promise.allSettled([
  ctx.apis.progressApi.getSummary(),
  ctx.apis.learnerApi.getCurrentProfile(),
]);
if (profile.status === "rejected") throw profile.reason; // screen cannot render without it
return {
  profile: profile.value,
  progress: progress.status === "fulfilled" ? progress.value : null,
};
```

Whichever shape applies, the schema marks the degrading fields nullable so the frontend knows to handle it.

## Async work

When the backend queues work, the mutation returns the pending record, never the result. The real instance of this is speaking assessment (`speaking.typeDefs.ts`):

```graphql
"""
Where one recording stands. There is no RUNNING: whether a worker currently
has the job in hand is the queue's business, and QUEUED is all a learner
watching a spinner needs to know.
"""
enum SpeakingAttemptStatus {
  AWAITING_UPLOAD
  QUEUED
  ASSESSED
  FAILED
}

type SpeakingAttempt {
  id: ID!
  status: SpeakingAttemptStatus!
  # ...result fields, populated once ASSESSED
}

type Query {
  speakingAttempt(id: ID!): SpeakingAttempt!
}
```

The frontend polls `speakingAttempt` until the status is terminal (`ASSESSED` or `FAILED`). A terminal failure state must be reachable, otherwise the client polls forever on failure - note the comment above choosing not to model a `RUNNING` state at all, because the frontend has no use for that distinction.

Do not raise the shared HTTP timeout for these calls. The timeout covers starting the work, not finishing it.

## Error mapping

Not per-resolver. A resolver throws or lets `BackendError` reject; the mapping happens once, centrally, in `graphql/errors.ts`'s `formatError` - Apollo's own error-formatting hook, wired into `ApolloServer` in `app.ts`:

```typescript
const STATUS_TO_CODE: Record<number, string> = {
  400: "BAD_USER_INPUT",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "BAD_USER_INPUT",
};

function codeForStatus(status: number): string {
  if (status === 0) return "BACKEND_UNAVAILABLE"; // BackendClient never reached the backend
  return STATUS_TO_CODE[status] ?? "INTERNAL_SERVER_ERROR";
}

export function formatError(formatted: GraphQLFormattedError, error: unknown) {
  const original = unwrap(error); // unwraps GraphQLError.originalError
  if (original instanceof BackendError) {
    const code = codeForStatus(original.status);
    return {
      message: SAFE_MESSAGES[code], // never original.message - that's the raw backend body
      extensions: { code, backendCode: original.code, traceId: original.traceId },
    };
  }
  // ...Apollo's own codes pass through; anything else collapses to INTERNAL_SERVER_ERROR
}
```

Codes: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`, `BACKEND_UNAVAILABLE`, `INTERNAL_SERVER_ERROR` - keyed off the backend's HTTP status, not a backend-supplied error code. `backendCode` (the backend's own stable domain string, e.g. `EXAM_SCORE_MISMATCH`) rides along in the extensions for a client that wants to key off it, separately from the GraphQL `code`. `traceId` is `BackendError.traceId`, for cross-system lookup - distinct from the per-request `x-request-id` the response header carries (`graphql/context.ts`).

An unrecognized status (or a plain `Error` with no `BackendError`) maps to a generic internal error rather than passing through. `logServerErrors` (the plugin next to `formatError`) is what keeps the real detail - server-side logs only, never the response.

## Tests

**A new module gets a resolver test and nothing else.** That is the convention in this repository, and it is deliberate: the resolver test already covers what a module can get wrong on its own - the auth check firing before any call, the arguments that reach the API client, the caps and defaults applied to them, and the mapping.

- **Resolver** - mock the API client. Assert the auth check, argument passing, mapping, and error translation. This is the one file to write per module.
- **API client** - no per-module test. `shared/http` is covered once by the `BackendClient` test; a module client that builds a path and delegates adds nothing a resolver test and the compiler do not already catch.
- **Loader** - only where a loader exists: assert one call for many keys, and that results come back in key order including nulls.
- **Integration** - shared, not per module. `graphql/schema.integration.test.ts` runs real operations against the server with the backend mocked, covering schema wiring, context, and the error contract for everything assembled into the schema.
- **Shared helpers** (`config/env.ts`, `shared/http/*`, `shared/graphql/*`, `graphql/scalars.ts`) get their own small test file next to the source, one per file, not one per exported function - `env.test.ts`, `backendClient.test.ts`, `queryParams.test.ts`, `scalars.test.ts`. A one-line function like `clampPageSize` doesn't get one; a parsing or validation function with a real branch (a calendar-date check, a positive-int check) does.
- **Express-level wiring** outside the module system - `app.test.ts`, `http/importRoute.test.ts` - covers what the schema integration test can't: the REST import route, and the app assembly itself.

Test the mapping and the failure paths. Testing that a pass-through resolver passes through is not worth the maintenance.

Adding a client to `GraphQLContext["apis"]` breaks every existing test that builds a context literal. Update those stubs (`examApi: {} as any`) rather than loosening the context type.
