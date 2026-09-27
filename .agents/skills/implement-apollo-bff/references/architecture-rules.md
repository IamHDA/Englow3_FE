# Architecture Rules

## Contents

1. What the BFF owns
2. Getting the backend contract
3. Module structure
4. Authentication
5. Per-request state
6. Aggregate queries and partial failure
7. Async backend work
8. Errors
9. Protecting the GraphQL surface
10. When not to add to the BFF

## What the BFF owns

The BFF owns **presentation shape**. It may rename, hide, reformat, and combine. It may add fields that exist only for display. It may expose a schema that looks nothing like the REST responses behind it.

It owns nothing else. Specifically it never:

- reaches a database, or carries an ORM, driver, or migration tool
- computes a business outcome - a score, a level, a streak, an eligibility check
- decides whether a state change is permitted
- writes to a table the backend owns
- holds a business transaction
- becomes a second copy of the backend service layer

The dividing question: if the answer would be wrong when computed twice in two places, it belongs to the backend. Presentation can be duplicated harmlessly; business truth cannot.

A resolver that starts branching on domain state - checking a status before allowing something, deriving a value from several fields - has crossed the line. Move it to the backend and expose the result.

## Getting the backend contract

Never write against an assumed endpoint shape.

The repo already generates it: `apps/bff/src/generated/backend-openapi.ts` is `openapi-typescript`'s output from the backend's live `/v3/api-docs` (`pnpm --filter bff run generate:backend`, pointed at `BACKEND_URL`). Check `paths["/api/..."]["method"]` there before anything else - regenerate first if it looks stale, and only ask the user when the generated types still don't settle it.

That happens in two cases: the endpoint genuinely doesn't exist on the backend yet, or a field is typed too loosely to trust - Springdoc renders a handful of backend fields as plain `string` where the real value is a fixed set (tutor role/status, exam `attemptStatus`, content review status, admin overview `kind`, speaking's `@JsonRawValue` tips/phonemes are the ones found so far; each gets a documented `Omit<Generated, "field"> & { field: TheRealUnion }` override rather than trusting the loose type). In either case, ask for what's missing, listing: method and path, path and query parameters, request body fields and types, response fields with nullability, error codes and statuses, pagination shape for lists, and for async endpoints what the immediate response contains. Accept the controller source, an OpenAPI excerpt, a captured response, or the DTO definitions - prose is not sufficient for field names and nullability.

Record what you were given (or derived) as the module's REST types. That file is the boundary: everything else in the module depends on it, so when the backend changes, exactly one file needs updating and TypeScript reports the rest.

If the endpoint does not exist yet, stop and say so. Building the BFF half first means building it twice, and the second version will differ in field names.

Springdoc also collides `operationId` across the admin controllers (the same verb - approve, reject, publish... - defined on five different admin resources gets `_1".."_5` suffixes by encounter order, not by which resource it is), which is why the generated types are read through `paths["/api/..."]["method"]` and never through the shorter `operations[...]`.

## Module structure

Modules are business capabilities, matching how the backend divides them unless there is a reason to diverge. Derive the list from the repository; if a capability fits nowhere, ask which module should own it.

Keep one vocabulary. If the backend calls it `exam`, the GraphQL type, the API client, the module folder, and the file prefix all say `exam`. Splitting a concept across two names is the most common source of confusion in a BFF, because the same entity then appears under different labels in the schema and in the client code.

**Modules are named for the entity, not for who calls them.** A backend `AdminExamController` does not make a BFF module called `adminExam`; it makes admin-scoped operations inside the `exam` module. Put the audience on the operation - `Query.adminExams` - where the difference is real, and leave the entity's types and enums audience-free.

The reason is mechanical, not aesthetic. GraphQL type names are global across the merged `typeDefs` array: two modules that each declare `enum ExamStatus` produce a schema build error, not a warning. Audience-scoped modules guarantee that collision the moment a second audience appears, and the fix is a cross-module move of every shared enum plus its imports.

So each domain enum lives in exactly one module - the bounded context it describes - and any module that needs it references it from there.

**Look-alike enums in different contexts stay separate.** Before adding an enum, check whether a similar one already exists and whether it is genuinely the same concept. If the backend deliberately kept two apart, keep two apart:

- `com.englow3.exam.entity.CertificateType` (half of what identifies a paper) is not `com.englow3.user.entity.CertificateType` (a learner's goal) - the backend translates at the call boundary rather than sharing one enum, and the BFF mirrors that.
- The exam module's `TargetLevel` (the band a paper is aimed at) is not onboarding's `CefrLevel` (the band a learner is at), despite both being `A1`..`C2`.

Sharing an enum across two contexts couples them: the day one side gains a value, the other side's schema silently gains it too, and the frontend now handles a value that context cannot produce. Same value set is not the same concept.

**Screen-oriented queries that span modules** - a dashboard, a home feed - belong to no single capability module. Do not silently attach them to whichever module supplied the most fields. Either give them their own module, declared as composing several others and depended on by none, or ask the user where they should live. State the choice; an unnamed exception becomes a habit.

## Authentication

The frontend obtains a token and sends it to the BFF. **The BFF does not verify the JWT at all** - it only checks that a bearer token is present (`ctx.requireToken()`, called at the top of any resolver that needs one) and forwards that same token, unchanged, to the backend, which is the sole verifier and decides authorization. This is deliberate, not an oversight: every request here is authenticated by a Bearer header rather than a cookie, so there is no session for the BFF to own, and the backend already has to verify on every call regardless of what the BFF does. Re-verifying the signature here would be a second copy of a check that only the backend's answer can make binding.

Consequences:

- A BFF-side check is presence only, never a guarantee about the token's validity. Never treat it as the security boundary, and never build a "current user" object from an unverified token.
- If a future need ever justifies verifying the JWT in the BFF itself (e.g. to branch UI-only behavior on claims without a round trip), that's a real addition - a `shared/auth/` module, cached JWKS with a refresh interval so the identity provider isn't hit every request - not something to retrofit quietly into `requireToken`.

Never log tokens, and never place them in a GraphQL response or an error extension.

## Per-request state

Context and API clients are constructed per request (`createContext` calls `createBackendClient(req.headers)` fresh every time). The same applies to any DataLoader, if one is ever added.

This is not a style preference. A DataLoader caches by key for its lifetime; if it outlives the request, one user's data is served to the next user whose query asks for the same ID. The same applies to any client that carries a token - which every `*Api` client here does, via the shared `BackendClient`.

Nothing in the BFF should hold cross-request state except configuration (`config/env.ts`, read once at startup).

## Aggregate queries and partial failure

A screen query that calls several backend endpoints will eventually have one of them fail. Decide the behavior deliberately:

- Fields the screen cannot render without stay non-null, and their failure fails the query.
- Fields the screen can render around are nullable, and their failure produces a null plus an entry in the GraphQL `errors` array.

GraphQL returns partial data with errors, and this is one of the real advantages it has over a REST aggregate endpoint. A dashboard missing one panel is better than a dashboard that fails entirely.

Make the choice per field and write it down in the schema through nullability, since nullability is where the frontend reads it.

## Async backend work

When the backend processes work asynchronously - persisting a pending record, returning immediately, and completing it in a worker - the GraphQL contract must reflect that. Do not model it as though the result were available.

The mutation returns the record with its current status, not the result. Completion is observed by the frontend, and the mechanism has to be decided rather than assumed: polling a query on an interval is the simplest and is usually right for a small system; a subscription is more work and adds transport requirements.

Whatever is chosen, the schema must expose enough to drive it: a status, an identifier to poll with, and a terminal failure state that the frontend can stop on. A contract that only has "pending" and "done" leaves the frontend polling forever on failure.

The HTTP timeout for these calls is the timeout for _starting_ the work, not for completing it. Do not raise the global client timeout to accommodate a slow provider - that hides real failures on every other call.

## Errors

Mapping is centralized, not per-resolver: `graphql/errors.ts`'s `formatError` (wired once into `ApolloServer` in `app.ts`) is the one place a `BackendError` becomes a client-facing error. A resolver just lets a `BackendError` (or anything else) throw or reject - it does not catch and translate its own errors. `formatError` maps the backend's HTTP status to a GraphQL code (`STATUS_TO_CODE`; unreached backend = status `0` = `BACKEND_UNAVAILABLE`), attaches the backend's own domain code as `extensions.backendCode` and its trace id as `extensions.traceId`, and replaces `.message` with a fixed safe string per code - the raw backend message never reaches the client. An error that isn't a recognized client code (Apollo's own parse/validation codes, or `UNAUTHENTICATED`/`FORBIDDEN`) collapses to a generic `INTERNAL_SERVER_ERROR`; `logServerErrors` is what keeps the real detail, server-side only.

Never surface: stack traces, internal URLs or host names, SQL or table names, provider payloads, tokens.

An unmapped backend error becomes a generic internal error, not a passthrough of whatever the backend said. Passthrough is how internal details leak.

## Protecting the GraphQL surface

A GraphQL endpoint lets the client compose its own query, which is the point and also the risk. Nested fields that resolve through other fields can be made arbitrarily deep and expensive.

**As of this writing, only two of these exist**: a capped request body (`express.json({ limit: "128kb" })`) and an IP-keyed rate limiter (`config/middleware.ts` - itself reviewed and documented as instance-local, not a global quota, see its own comment). There is no query depth limit, no complexity/cost limit, and no explicit introspection toggle anywhere in `app.ts` - Apollo Server 4 does not disable introspection by environment on its own, so it is on wherever this runs. Page size *is* capped, but per-argument (`clampPageSize`, `shared/graphql/pagination.ts`), not as a schema-wide complexity budget.

Treat this as a known gap, not a settled decision: if a change meaningfully grows the schema's nesting or the audience able to reach it, raise the missing depth/complexity limit and the open introspection with the user rather than assuming either is already handled. These are cheap to add and hard to retrofit after the schema is large - which is exactly the state it's approaching now, at ten modules.

## When not to add to the BFF

The BFF earns its place when a screen needs several endpoints combined, when clients need different shapes of the same data, or when the frontend benefits from selecting fields.

It does not earn its place as a pass-through. A query that forwards one REST call and renames nothing adds a hop, a deployment, and a second place to change when the field list changes.

If a proposed addition is a pass-through, say so and let the user decide. Not every endpoint needs to appear in the schema.
