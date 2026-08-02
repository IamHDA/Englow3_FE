---
name: implement-apollo-bff
description: Implement, extend, refactor, or review the Apollo GraphQL BFF that sits between the frontend and the Spring Boot backend. Use this skill whenever work touches the BFF - adding a query or mutation, writing typeDefs, resolvers, API clients, mappers, DataLoaders, GraphQL context, authentication forwarding, error mapping, or aggregate screen queries. Trigger it even when the request sounds like a plain task ("add a GraphQL query for exams", "why is this making 20 requests", "where should this resolver go") and names none of the above. This is a thin BFF that owns presentation shape only, never business rules, never database access.
---

# Apollo BFF

Node.js, TypeScript, Apollo Server. It sits between the frontend and the Spring Boot backend:

```text
Frontend  --GraphQL-->  Apollo BFF  --REST-->  Spring Boot  -->  database, storage, AI providers
```

The BFF exists to shape data for screens: expose a GraphQL contract that matches what the frontend renders, combine several REST calls into one response, forward authentication, and normalize errors. It owns none of the business logic and touches no database.

Layering is deliberately shallow:

```text
typeDefs -> resolver -> API client -> Spring Boot REST
```

Add a mapper or a DataLoader only when it solves a problem that already exists. Do not scaffold files that hold nothing.

## Never guess the backend contract

**Before writing an API client method, a GraphQL field, a mapper, or a type, you must have the real request and response shape of the Spring Boot endpoint.** Do not infer it from the endpoint name, from the GraphQL schema you are about to write, or from what a reasonable API would look like. A BFF built on a guessed contract fails at integration time, and the failure looks like a BFF bug rather than a wrong assumption.

If you do not have the contract, stop and ask. Name the endpoint and list exactly what is missing:

- HTTP method and full path
- Path and query parameters, with types
- Request body: field names, types, which are optional
- Response body: field names, types, which can be null
- Error responses: status codes and the error code values
- For lists: the pagination shape actually returned
- For anything async: what the immediate response contains and how completion is observed

Accept any of these as the contract: the controller method with its request/response records, an OpenAPI or Swagger excerpt, a real response captured from the running backend, or the DTO source. A prose description is not enough for field names and nullability - ask for something concrete.

If the user supplies part of it, ask only for the rest. If they say the endpoint does not exist yet, say so plainly and stop: the backend endpoint is the prerequisite, and writing the BFF side first means writing it twice.

Once you have it, encode it in the module's `*.types.ts` as the REST response type. That file is the record of what the backend actually returns, and the rest of the module depends on it rather than on assumptions.

## Where code goes

```text
src/
├── index.ts                  startup
├── server.ts                 Apollo Server setup
├── config/                   env validation, logger
├── graphql/                  schema assembly, context, scalars, error codes
├── modules/<module>/
│   ├── <module>.typeDefs.ts  GraphQL contract
│   ├── <module>.resolvers.ts thin - args, auth check, call, map
│   ├── <module>.api.ts       Spring Boot endpoints for this module
│   ├── <module>.types.ts     REST request/response types, from the real contract
│   ├── <module>.mapper.ts    only when the GraphQL model differs
│   └── <module>.loader.ts    only when a real N+1 exists
└── shared/
    ├── auth/                 token extraction, verification, current user
    ├── http/                 backend client, error parsing, headers
    └── loader/               DataLoader helpers
```

Derive the module list from the repository, not from assumption. If a new capability fits no existing module, ask which module owns it rather than inventing one. Keep one name per concept across `typeDefs`, `api`, and file names - a type called `Exam` living in a module called `assessment` with a client called `ExamApi` will confuse every later reader.

## Responsibilities

| Part | Holds | Never holds |
|---|---|---|
| `typeDefs` | The frontend contract | REST paths, business rules |
| `resolver` | Args, auth check, call, map | Business rules, retries, orchestration logic that belongs to the backend |
| `api` | One module's REST calls | GraphQL shaping |
| `mapper` | REST response to GraphQL model | Calls, mutation of data |
| `loader` | Batching within one request | Cache shared across users or requests |
| `context` | Current user, token, clients, loaders | Workflow |
| `shared/http` | Base URL, headers, timeout, error parsing | Anything module-specific |

## Rules that always hold

- The BFF never reaches the database, and carries no ORM, driver, or migration tooling.
- The BFF never decides business outcomes - scoring, level determination, whether a state change is allowed. It asks the backend and reports the answer.
- Authentication is forwarded, not replaced. The BFF verifies the token to fail early; the backend still verifies and still decides authorization.
- Context, API clients, and DataLoaders are created per request. A DataLoader shared across requests leaks one user's data into another's response.
- Nothing internal reaches the client: no stack traces, no internal URLs, no table names, no provider payloads, no tokens.
- Every new GraphQL field must be traceable to a real backend field or to an explicit presentation transformation. No field is invented.

Full reasoning: [architecture-rules.md](references/architecture-rules.md).

## Plan before writing

State briefly:

1. Which backend endpoints are involved, and confirm you have their real contracts.
2. The GraphQL shape the screen needs, and how it differs from the REST shape.
3. Which module owns it.
4. Whether a mapper is justified, or the REST response can be returned directly.
5. Whether this can produce N+1, and whether a batch endpoint exists to fix it.
6. For aggregate queries: which fields may degrade to null if one call fails.
7. For anything async on the backend: what the mutation returns and how completion is observed.

Raise conflicts with the rules above before coding.

Patterns and skeletons: [implementation-patterns.md](references/implementation-patterns.md).

## Before reporting done

Walk [verification-checklist.md](references/verification-checklist.md). Report what changed, which backend contracts you relied on and where they came from, what you deliberately left out, and every assumption you had to make.
