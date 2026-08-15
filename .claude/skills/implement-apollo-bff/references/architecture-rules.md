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

Ask for the real thing, listing what is missing: method and path, path and query parameters, request body fields and types, response fields with nullability, error codes and statuses, pagination shape for lists, and for async endpoints what the immediate response contains.

Accept the controller source, an OpenAPI excerpt, a captured response, or the DTO definitions. Prose is not sufficient for field names and nullability.

Record what you were given as the module's REST types. That file is the boundary: everything else in the module depends on it, so when the backend changes, exactly one file needs updating and TypeScript reports the rest.

If the endpoint does not exist yet, stop and say so. Building the BFF half first means building it twice, and the second version will differ in field names.

## Module structure

Modules are business capabilities, matching how the backend divides them unless there is a reason to diverge. Derive the list from the repository; if a capability fits nowhere, ask which module should own it.

Keep one vocabulary. If the backend calls it `exam`, the GraphQL type, the API client, the module folder, and the file prefix all say `exam`. Splitting a concept across two names is the most common source of confusion in a BFF, because the same entity then appears under different labels in the schema and in the client code.

**Screen-oriented queries that span modules** - a dashboard, a home feed - belong to no single capability module. Do not silently attach them to whichever module supplied the most fields. Either give them their own module, declared as composing several others and depended on by none, or ask the user where they should live. State the choice; an unnamed exception becomes a habit.

## Authentication

The frontend obtains a token and sends it to the BFF. The BFF verifies it to build the current user and to fail unauthenticated requests early. The BFF forwards the same token to the backend, which verifies it again and performs the real authorization.

Two consequences:

- A BFF-side check is a convenience, never a guarantee. Never treat a resolver-level check as the security boundary.
- Token verification runs on every request, so the verification key material must be cached in memory with a sensible refresh. Fetching it per request adds a network round trip to every call and makes the BFF fail whenever the identity provider is slow.

Never log tokens, and never place them in a GraphQL response or an error extension.

## Per-request state

Context, API clients, and DataLoaders are constructed per request.

This is not a style preference. A DataLoader caches by key for its lifetime; if it outlives the request, one user's data is served to the next user whose query asks for the same ID. The same applies to any client that carries a token.

Nothing in the BFF should hold cross-request state except configuration and the verification key cache.

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

The backend should return a stable error contract - a code, a message, a request identifier. The BFF maps that code to a GraphQL error code and passes the identifier through so a report can be traced across both systems.

Never surface: stack traces, internal URLs or host names, SQL or table names, provider payloads, tokens.

An unmapped backend error becomes a generic internal error, not a passthrough of whatever the backend said. Passthrough is how internal details leak.

## Protecting the GraphQL surface

A GraphQL endpoint lets the client compose its own query, which is the point and also the risk. Nested fields that resolve through other fields can be made arbitrarily deep and expensive.

At minimum: limit query depth, limit overall complexity or cost, and cap page sizes rather than trusting the requested value. Disable introspection in production; leave it on in development.

These are cheap to add and hard to retrofit after the schema is large.

## When not to add to the BFF

The BFF earns its place when a screen needs several endpoints combined, when clients need different shapes of the same data, or when the frontend benefits from selecting fields.

It does not earn its place as a pass-through. A query that forwards one REST call and renames nothing adds a hop, a deployment, and a second place to change when the field list changes.

If a proposed addition is a pass-through, say so and let the user decide. Not every endpoint needs to appear in the schema.
