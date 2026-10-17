# Verification Checklist

Walk this before reporting work as finished. Anything unchecked is either fixed or reported.

## Contract

- Every backend call is based on a real contract the user supplied, not an inferred one.
- The contract is recorded in the module's REST types, including nullability.
- No GraphQL field exists that does not trace to a backend field or to an explicit presentation transformation.
- If any part of the contract was missing, it was asked for rather than assumed.

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
- Timestamps use the date scalar, not `String`.
- Page size is capped rather than trusting the requested value.
- Enum values match the backend's actual values.

## Per-request state

- Context, API clients, and loaders are created per request.
- No loader, client, or token is held in module scope.
- Token verification keys are cached; verification does not fetch per request.

## Resilience

- Aggregate queries use settled results, and fields that may degrade are nullable.
- A field the screen cannot render without fails the query rather than returning null.
- Async backend work returns a pending record with a status, a terminal failure state, and a way to poll.
- The shared HTTP timeout was not raised to accommodate one slow call.

## Security

- No stack trace, internal URL, table name, provider payload, or token reaches the client.
- Unmapped backend errors become a generic internal error, not a passthrough.
- Tokens are never logged.
- Path segments built from user input are encoded.
- Query depth and complexity limits are in place; introspection is off outside development.

## Build and tests

- TypeScript compiles and the tests pass. Do not report done without running them.
- Resolver, client, and mapping paths are covered, including failures.

## Report

State what changed, which backend contracts you used and where they came from, what you deliberately left out, and every assumption you had to make.
