"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import { useAuth } from "@/features/auth";
import { useOnboarding } from "@/features/onboarding";
import { OnboardingStep, Role } from "@/lib/graphql/generated";
import {
  useCompleteMyTourMutation,
  useMyTourStatusQuery,
} from "@/lib/graphql/generated/hooks";
import { TourSpotlight } from "./TourSpotlight";

import { ADMIN_TOUR, LEARNER_TOUR, STAFF_TOUR } from "./constants/tourSteps";

type UserTourContextValue = {
  canReplay: boolean;
  replay: () => void;
  activeTarget: string | null;
};

const UserTourContext = createContext<UserTourContextValue | null>(null);

export function useUserTour(): UserTourContextValue {
  const context = useContext(UserTourContext);
  if (!context) throw new Error("useUserTour requires UserTourProvider");
  return context;
}

function stepsFor(
  role: Role,
): readonly import("./constants/tourSteps").TourStep[] {
  switch (role) {
    case Role.ADMIN:
      return ADMIN_TOUR;
    case Role.STAFF:
      return STAFF_TOUR;
    case Role.LEARNER:
      return LEARNER_TOUR;
  }
}

export function UserTourProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { profile } = useAccountProfile();
  const { requiresOnboarding } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();
  const role = profile?.role;
  const identity = profile ? `${profile.id}:${role}` : null;
  const isBackOffice = role === Role.ADMIN || role === Role.STAFF;
  const home = isBackOffice ? "/admin" : "/";
  const eligible = Boolean(
    session &&
    profile &&
    // AccountProvider scopes this profile to the authenticated session.
    // profile.id is the application's UUID; session.userId is Supabase's UUID.
    !pathname.startsWith("/auth") &&
    !requiresOnboarding &&
    (isBackOffice
      ? pathname.startsWith("/admin")
      : role === Role.LEARNER &&
        profile.onboardingStep === OnboardingStep.COMPLETED),
  );
  const {
    data,
    loading,
    error: statusError,
  } = useMyTourStatusQuery({
    skip: !eligible,
    fetchPolicy: "network-only",
  });
  const [completeTour] = useCompleteMyTourMutation();
  const [dismissedIdentity, setDismissedIdentity] = useState<string | null>(
    null,
  );
  const [replayIdentity, setReplayIdentity] = useState<string | null>(null);
  const [replayNumber, setReplayNumber] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = role ? stepsFor(role) : [];
  const index = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const completed = data?.myTourStatus.completed === true;
  const opened =
    eligible &&
    pathname === home &&
    identity != null &&
    (replayIdentity === identity ||
      (!loading &&
        !statusError &&
        data != null &&
        !completed &&
        dismissedIdentity !== identity));

  async function dismiss() {
    if (!identity) return;
    if (!completed) {
      const result = await completeTour();
      if (!result.data?.completeMyTour.completed)
        throw new Error("Tour completion was not saved");
    }
    setDismissedIdentity(identity);
    setReplayIdentity(null);
  }

  function replay() {
    if (!eligible || !identity) return;
    setStepIndex(0);
    setReplayNumber((number) => number + 1);
    setReplayIdentity(identity);
    if (pathname !== home) router.push(home);
  }

  function pause() {
    setDismissedIdentity(identity);
    setReplayIdentity(null);
  }

  return (
    <UserTourContext.Provider
      value={{
        canReplay: eligible,
        replay,
        activeTarget: opened ? steps[index].target : null,
      }}
    >
      {children}
      {role && (
        <TourSpotlight
          key={`${identity}:${replayNumber}`}
          steps={steps}
          stepIndex={index}
          onStepChange={setStepIndex}
          opened={opened}
          onDismiss={dismiss}
          onPause={pause}
        />
      )}
    </UserTourContext.Provider>
  );
}
