import type { Relationship } from "../../generated/graphql.js";
import type { RelationshipResponse } from "./friendship.types.js";

/**
 * The one place the REST name meets the GraphQL one: the backend calls the
 * field `relationship`, the schema's `Relationship` type calls it `status`
 * (a `relationship` field inside a type called `Relationship` would read
 * badly). Every resolver that returns a `Relationship` goes through this, so a
 * rule that reads `.status` can never be reading a field the REST body does not
 * have - which would make it silently never match.
 */
export const toRelationship = (r: RelationshipResponse): Relationship => ({
  userId: r.userId,
  status: r.relationship,
  requestId: r.requestId ?? null,
});
