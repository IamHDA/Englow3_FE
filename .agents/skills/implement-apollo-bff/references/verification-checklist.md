# Verification Checklist

Walk this before reporting work as finished. Anything unchecked is either fixed or reported.

## Contract

- Every backend call is based on a real contract - `generated/backend-openapi.ts` (regenerated if stale) first, the user asked only for what the generated types couldn't settle.
- The module's `*.types.ts` derives from `paths[...]` rather than hand-declaring a literal; any override of an under-typed field is documented next to the override.
- No GraphQL field exists that does not trace to a backend field or to an explicit presentation transformation.
- If any part of the contract was missing even after regenerating, it was asked for rather than assumed.

## Boundaries

- No business rule appears in a resolver: no branching on domain state, no derived business values.
- No database access, ORM, driver, or migration tooling anywhere in the BFF.
- The BFF does not decide whether a state change is allowed - it calls the backend and reports the result.
- Nothing became a second copy of a backend service.

## Structure

- The module is one the repository already has, or the user was asked which should own it.
- One vocabulary per concept across typeDefs, API client, and file names.
- Screen-spanning queries have a declared home rather than being attached to an arbitrary module.
- No mapper that copies fields one to one; no loader without a real N+1; no empty scaffolding.

## Schema

- Nullability is deliberate on every new field, and matches what the backend can return.
- Timestamps use the `Date`/`DateTime` scalar, not `String` - both reject malformed values at runtime, so a field typed this way is a real guarantee, not just documentation.
- Page size is capped (`clampPageSize`) rather than trusting the requested value.
- Enum values match the backend's actual values - and where the backend types a field as plain `string` for a computed or `@JsonRawValue` value, the module's `*.types.ts` reasserts the real union with a documented `Omit<...> & {...}` override rather than trusting the loose type.

## Per-request state

- Context and API clients are created per request; so is any DataLoader, if one is added.
- No loader, client, or token is held in module scope.
- No JWT verification was added to the BFF in passing - it still only checks token presence (`requireToken`) and forwards the token unchanged. If this task genuinely needed BFF-side verification, that was raised as a real addition, not slipped into `requireToken`.

## Resilience

- Fields that may degrade independently are their own nullable field with its own resolver (letting graphql-js null it on rejection), or, only for a true single-object aggregate, built from settled results - either way, nullable in the schema.
- A field the screen cannot render without fails the query rather than returning null.
- Async backend work returns a pending record with a status, a terminal failure state, and a way to poll.
- The shared HTTP timeout was not raised to accommodate one slow call.

## Security

- No stack trace, internal URL, table name, provider payload, or token reaches the client.
- Unmapped backend errors become a generic internal error, not a passthrough.
- Tokens are never logged.
- Path segments built from user input are encoded.
- Query depth/complexity limits and an introspection toggle are **not implemented** in this codebase today (only a body-size cap and an IP-keyed rate limiter exist). Don't report this as covered - if the change meaningfully grows the schema's reach, raise the gap with the user instead of assuming it's handled elsewhere.

## Build and tests

- TypeScript compiles and the tests pass. Do not report done without running them.
- Resolver, client, and mapping paths are covered, including failures.

## Report

State what changed, which backend contracts you used and where they came from, what you deliberately left out, and every assumption you had to make.
