import { ADMIN_TOUR, LEARNER_TOUR, STAFF_TOUR, type TourStep } from "./steps";

/**
 * The steps a role sees. The placement step is left out once a placement
 * result is on record, as on the web: there is nothing left to point at.
 */
export function stepsFor(
  role: string | null | undefined,
  placementTaken: boolean,
): readonly TourStep[] {
  const steps =
    role === "ADMIN"
      ? ADMIN_TOUR
      : role === "STAFF"
        ? STAFF_TOUR
        : role === "LEARNER"
          ? LEARNER_TOUR
          : [];
  return steps.filter(
    (step) => !(placementTaken && step.target === "learner-placement"),
  );
}
