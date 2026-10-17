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

The contract the user supplied becomes the module's REST types. Everything else depends on this file, so a backend change breaks compilation in one place instead of failing silently at runtime.

```typescript
// exam.types.ts - mirrors GET /api/exams/{id} exactly as the backend returns it
export type ExamApiResponse = {
  id: string;
  title: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  questionCount: number;
  creatorId: string;
  publishedAt: string | null; // null while not published
  createdAt: string;
};

export type ExamPageApiResponse = {
  content: ExamApiResponse[]; // whatever the backend actually calls it
  page: number;
  size: number;
  totalElements: number;
};
```

Do not adjust names here to be prettier. This file is a record of reality; renaming belongs in the mapper.

## typeDefs

The schema serves the screen, not the backend. It may rename, omit, and add display fields.

```typescript
export const examTypeDefs = `#graphql
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

Use a `DateTime` scalar rather than `String` for timestamps, so the frontend gets a parsed value and the contract states the format once.

Nullability is a decision, not a default. A field that can fail independently, or that the backend can return as null, is nullable; everything else is not.

## Resolvers

Thin: read args, check auth, call, map. No branching on domain state.

```typescript
export const examResolvers = {
  Query: {
    exam: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const response = await ctx.apis.examApi.getExam(id);
      return mapExam(response);
    },
  },

  Mutation: {
    publishExam: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      ctx.requireUser();
      return mapExam(await ctx.apis.examApi.publishExam(id));
    },
  },
};
```

Never do this - it duplicates a backend rule, and the two copies will drift:

```typescript
if (exam.questionCount === 0) {
  throw new Error("Exam cannot be published"); // wrong layer
}
```

`ctx.requireUser()` fails unauthenticated callers early. It is not the authorization check - the backend still decides whether this user may publish.

## API client

One client per module, wrapping that module's endpoints. Return types come from `*.types.ts`.

```typescript
export class ExamApi {
  constructor(private readonly client: BackendClient) {}

  getExam(id: string): Promise<ExamApiResponse> {
    return this.client.get(`/api/exams/${encodeURIComponent(id)}`);
  }

  publishExam(id: string): Promise<ExamApiResponse> {
    return this.client.post(`/api/exams/${encodeURIComponent(id)}/publish`);
  }
}
```

Encode path segments. An unescaped identifier in a template string is a path-traversal opening.

## Backend HTTP client

One shared client: base URL, auth header, request id, timeout, JSON parsing, error translation.

```typescript
export class BackendClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string,
    private readonly requestId?: string,
  ) {}

  get<T>(path: string) {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        ...(this.requestId ? { "x-request-id": this.requestId } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(env.BACKEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw await BackendError.fromResponse(response);
    }
    return response.json() as Promise<T>;
  }
}
```

Never log the token, the authorization header, or media payloads.

## Context

Built per request. Everything token-scoped lives here and nowhere else.

```typescript
export const createContext = async ({ req }): Promise<GraphQLContext> => {
  const token = extractBearerToken(req.headers.authorization);
  const currentUser = token ? await authenticate(token) : null; // cached JWKS

  const client = new BackendClient(
    env.BACKEND_BASE_URL,
    token,
    req.headers["x-request-id"],
  );

  return {
    currentUser,
    requireUser: () => {
      if (!currentUser) throw unauthenticatedError();
      return currentUser;
    },
    apis: {
      examApi: new ExamApi(client),
      learnerApi: new LearnerApi(client),
    },
    loaders: {
      learnerLoader: createLearnerLoader(client),
    },
  };
};
```

`authenticate` must not fetch verification keys on every call. Cache them in module scope with a refresh interval; without that, every GraphQL request costs an extra round trip and the BFF fails whenever the identity provider is slow.

## Mapper

Only when the GraphQL model differs. If it matches, return the response directly - a mapper that copies fields one to one is a file to keep in sync for no benefit.

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

Only after a real N+1. A field resolver that fires one call per parent row over a list is the case:

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

```typescript
export const dashboardResolvers = {
  Query: {
    dashboard: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      ctx.requireUser();

      const [progress, profile, recent] = await Promise.allSettled([
        ctx.apis.progressApi.getSummary(),
        ctx.apis.learnerApi.getCurrentProfile(),
        ctx.apis.speakingApi.getRecentResult(),
      ]);

      if (profile.status === "rejected") {
        throw profile.reason; // screen cannot render without it
      }

      return {
        profile: mapProfile(profile.value),
        progress:
          progress.status === "fulfilled" ? mapProgress(progress.value) : null,
        recentSpeaking:
          recent.status === "fulfilled" ? mapSpeaking(recent.value) : null,
      };
    },
  },
};
```

`Promise.allSettled` rather than `Promise.all`: one slow or failing panel should not blank the screen. The schema marks `progress` and `recentSpeaking` nullable so the frontend knows to handle it.

## Async work

When the backend queues work, the mutation returns the pending record, never the result.

```graphql
type SpeakingSubmission {
  id: ID!
  status: JobStatus! # PENDING RUNNING COMPLETED FAILED
  result: SpeakingResult # null until COMPLETED
  failureReason: String # set when FAILED
}

type Mutation {
  submitSpeaking(input: SubmitSpeakingInput!): SpeakingSubmission!
}
type Query {
  speakingSubmission(id: ID!): SpeakingSubmission!
}
```

The frontend polls `speakingSubmission` until the status is terminal. `FAILED` must be reachable and must carry a reason, otherwise the client polls forever on failure.

Do not raise the shared HTTP timeout for these calls. The timeout covers starting the work, not finishing it.

## Error mapping

```typescript
export const toGraphQLError = (error: BackendError) =>
  new GraphQLError(safeMessage(error), {
    extensions: {
      code: mapBackendCode(error.code), // unknown code -> INTERNAL_SERVER_ERROR
      requestId: error.requestId,
    },
  });
```

Codes: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`, `NOT_FOUND`, `CONFLICT`, `BACKEND_UNAVAILABLE`, `INTERNAL_SERVER_ERROR`.

An unrecognized backend code maps to a generic internal error rather than passing through. Pass the request id so a report can be traced across both systems; keep the HTTP status out of the extensions unless the frontend actually uses it.

## Tests

**A new module gets a resolver test and nothing else.** That is the convention in this repository, and it is deliberate: the resolver test already covers what a module can get wrong on its own - the auth check firing before any call, the arguments that reach the API client, the caps and defaults applied to them, and the mapping.

- **Resolver** - mock the API client. Assert the auth check, argument passing, mapping, and error translation. This is the one file to write per module.
- **API client** - no per-module test. `shared/http` is covered once by the `BackendClient` test; a module client that builds a path and delegates adds nothing a resolver test and the compiler do not already catch.
- **Loader** - only where a loader exists: assert one call for many keys, and that results come back in key order including nulls.
- **Integration** - shared, not per module. `graphql/schema.integration.test.ts` runs real operations against the server with the backend mocked, covering schema wiring, context, and the error contract for everything assembled into the schema.

Test the mapping and the failure paths. Testing that a pass-through resolver passes through is not worth the maintenance.

Adding a client to `GraphQLContext["apis"]` breaks every existing test that builds a context literal. Update those stubs (`examApi: {} as any`) rather than loosening the context type.
