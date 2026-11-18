import { PersonListSkeleton } from "../../parts/PersonListSkeleton";

/** A page of blocked people: picture, name, and the "Bỏ chặn" button. */
export function BlockedUserListSkeleton() {
  return <PersonListSkeleton rows={3} actionWidths={[96]} />;
}
