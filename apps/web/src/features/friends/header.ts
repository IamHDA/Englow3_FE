// What the global header imports, and nothing else.
//
// The header is on every page. Imported through "@/features/friends" it would
// pull the barrel's views (the friends screens, the wall, the relationship
// actions) into a chunk every page loads, for the sake of one number. This
// entry reaches only the badge and the query behind it.
export { IncomingRequestsBadge } from "./components/views/IncomingRequestsBadge";
