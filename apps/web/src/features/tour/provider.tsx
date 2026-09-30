"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";

import { useAccountProfile } from "@/features/account";
import { useAuth } from "@/features/auth";
import { useOnboarding } from "@/features/onboarding";
import { OnboardingStep, Role } from "@/lib/graphql/generated";
import {
  useCompleteMyTourMutation,
  useMyTourStatusQuery,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  ADMIN_TOUR,
  LEARNER_TOUR,
  STAFF_TOUR,
  type TourStep,
} from "./constants/tourSteps";

type UserTourContextValue = {
  canReplay: boolean;
  replay: () => void;
};

const UserTourContext = createContext<UserTourContextValue | null>(null);

export function useUserTour(): UserTourContextValue {
  const context = useContext(UserTourContext);
  if (!context) throw new Error("useUserTour requires UserTourProvider");
  return context;
}

function stepsFor(role: Role): readonly TourStep[] {
  switch (role) {
    case Role.ADMIN:
      return ADMIN_TOUR;
    case Role.STAFF:
      return STAFF_TOUR;
    case Role.LEARNER:
      return LEARNER_TOUR;
  }
}

function TourDialog({
  steps,
  opened,
  onDismiss,
}: {
  steps: readonly TourStep[];
  opened: boolean;
  onDismiss: () => Promise<void>;
}) {
  const { isVi } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const step = steps[stepIndex];

  async function dismiss() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      await onDismiss();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => void dismiss()}
      title={isVi ? "Hướng dẫn sử dụng Englow3" : "Explore Englow3"}
      centered
      size={620}
      radius="lg"
      closeOnClickOutside={false}
      closeOnEscape={!busy}
      withCloseButton={false}
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Badge variant="light" color="orange">
            {isVi
              ? `Bước ${stepIndex + 1} / ${steps.length}`
              : `Step ${stepIndex + 1} / ${steps.length}`}
          </Badge>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={() => void dismiss()}
            disabled={busy}
          >
            {isVi ? "Bỏ qua" : "Skip"}
          </Button>
        </Group>
        <Progress
          value={((stepIndex + 1) / steps.length) * 100}
          color="orange"
          aria-label={isVi ? "Tiến độ hướng dẫn" : "Tour progress"}
        />
        <Stack gap="xs">
          <Title order={2}>{isVi ? step.titleVi : step.titleEn}</Title>
          <Text c="dimmed">{isVi ? step.bodyVi : step.bodyEn}</Text>
        </Stack>
        <Group gap="xs">
          {step.links.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              variant="light"
              color="navy"
              size="sm"
            >
              {isVi ? link.vi : link.en}
            </Button>
          ))}
        </Group>
        {error && (
          <Alert color="red" role="alert">
            {isVi
              ? "Chưa lưu được hướng dẫn. Vui lòng thử lại."
              : "Could not save your tour progress. Please retry."}
          </Alert>
        )}
        <Group justify="space-between">
          <Button
            variant="subtle"
            disabled={stepIndex === 0 || busy}
            onClick={() => setStepIndex((index) => index - 1)}
          >
            {isVi ? "Quay lại" : "Back"}
          </Button>
          {stepIndex === steps.length - 1 ? (
            <Button
              color="orange"
              loading={busy}
              onClick={() => void dismiss()}
            >
              {isVi ? "Hoàn tất" : "Finish"}
            </Button>
          ) : (
            <Button
              color="orange"
              onClick={() => setStepIndex((index) => index + 1)}
            >
              {isVi ? "Tiếp" : "Next"}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}

export function UserTourProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { profile } = useAccountProfile();
  const { requiresOnboarding } = useOnboarding();
  const pathname = usePathname();
  const role = profile?.role;
  const identity = profile ? `${profile.id}:${role}` : null;
  const isBackOffice = role === Role.ADMIN || role === Role.STAFF;
  const eligible = Boolean(
    session &&
    profile &&
    profile.id === session.userId &&
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
  const completed = data?.myTourStatus.completed === true;
  const opened =
    eligible &&
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
    setReplayNumber((number) => number + 1);
    setReplayIdentity(identity);
  }

  return (
    <UserTourContext.Provider value={{ canReplay: eligible, replay }}>
      {children}
      {role && (
        <TourDialog
          key={`${identity}:${replayNumber}`}
          steps={stepsFor(role)}
          opened={opened}
          onDismiss={dismiss}
        />
      )}
    </UserTourContext.Provider>
  );
}
