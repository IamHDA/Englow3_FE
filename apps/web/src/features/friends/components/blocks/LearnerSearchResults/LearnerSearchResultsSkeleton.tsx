import { PersonListSkeleton } from "../../parts/PersonListSkeleton";

/** Search results on their way: picture, name and one button per learner. */
export function LearnerSearchResultsSkeleton() {
  return <PersonListSkeleton rows={4} actionWidths={[104]} />;
}
