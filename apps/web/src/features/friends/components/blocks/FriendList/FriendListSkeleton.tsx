import { PersonListSkeleton } from "../../parts/PersonListSkeleton";

/** A page of friends: picture, name, and the one "Bạn bè" button. */
export function FriendListSkeleton() {
  return <PersonListSkeleton rows={6} actionWidths={[104]} />;
}
