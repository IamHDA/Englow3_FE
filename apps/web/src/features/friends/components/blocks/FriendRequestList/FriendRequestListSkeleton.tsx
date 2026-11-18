import { PersonListSkeleton } from "../../parts/PersonListSkeleton";

/** A page of requests: picture, name, and the accept / decline buttons. */
export function FriendRequestListSkeleton() {
  return <PersonListSkeleton rows={4} actionWidths={[104, 84]} />;
}
