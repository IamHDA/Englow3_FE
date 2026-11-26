import { router, usePathname } from "expo-router";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { isBackOfficeRole, useAuth } from "@/features/auth/AuthProvider";
import {
  OnboardingStep,
  useCompleteMyTourMutation,
  useMyTourStatusQuery,
} from "@/lib/graphql/generated";
import { AppText, Button, Notice, Row } from "@/ui/components";
import { colors, radius, spacing } from "@/ui/theme";

import { stepsFor } from "./stepsFor";

type TourContextValue = { canReplay: boolean; replay: () => void };

const TourContext = createContext<TourContextValue>({
  canReplay: false,
  replay: () => undefined,
});

export const useTour = () => useContext(TourContext);

/**
 * The first-run walkthrough, as the web's UserTourProvider: it opens once on
 * the home screen of a learner who finished setup (or the back-office home
 * for staff), and finishing or skipping it is recorded on the account, so it
 * does not come back on another device. Anyone can replay it.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const pathname = usePathname();
  const role = me?.role;
  const identity = me ? `${me.id}:${role}` : null;
  const backOffice = isBackOfficeRole(role);
  const home = backOffice ? "/admin" : "/";
  const eligible = Boolean(
    me &&
    (backOffice ||
      (role === "LEARNER" && me.onboardingStep === OnboardingStep.COMPLETED)),
  );
  const status = useMyTourStatusQuery({
    skip: !eligible,
    fetchPolicy: "network-only",
  });
  const [complete, completing] = useCompleteMyTourMutation();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [replaying, setReplaying] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [failed, setFailed] = useState(false);

  const steps = stepsFor(
    role,
    Boolean(me?.onboardingState?.placementAttemptId),
  );
  const completed = status.data?.myTourStatus.completed === true;
  const opened =
    eligible &&
    steps.length > 0 &&
    pathname === home &&
    identity !== null &&
    (replaying === identity ||
      (!status.loading &&
        !status.error &&
        status.data != null &&
        !completed &&
        dismissed !== identity));

  async function finish() {
    if (!identity) return;
    setFailed(false);
    if (!completed) {
      try {
        const result = await complete();
        if (!result.data?.completeMyTour.completed)
          throw new Error("Not saved");
        await status.refetch().catch(() => undefined);
      } catch {
        setFailed(true);
        return;
      }
    }
    setDismissed(identity);
    setReplaying(null);
  }

  /** Leaves for a step's place without marking the tour done; it returns next time. */
  function pause() {
    setDismissed(identity);
    setReplaying(null);
  }

  function replay() {
    if (!eligible || !identity) return;
    setRun((value) => value + 1);
    setReplaying(identity);
    if (pathname !== home) router.navigate(backOffice ? "/admin" : "/");
  }

  return (
    <TourContext.Provider value={{ canReplay: eligible, replay }}>
      {children}
      {opened ? (
        <TourModal
          key={`${identity}:${run}`}
          steps={steps}
          busy={completing.loading}
          failed={failed}
          onFinish={() => void finish()}
          onOpen={(href) => {
            pause();
            router.push(href);
          }}
        />
      ) : null}
    </TourContext.Provider>
  );
}

function TourModal({
  steps,
  busy,
  failed,
  onFinish,
  onOpen,
}: {
  steps: ReturnType<typeof stepsFor>;
  busy: boolean;
  failed: boolean;
  onFinish: () => void;
  onOpen: (
    href: NonNullable<ReturnType<typeof stepsFor>[number]["href"]>,
  ) => void;
}) {
  const [index, setIndex] = useState(0);
  const step = steps[Math.min(index, steps.length - 1)];
  if (!step) return null;
  const last = index >= steps.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFinish}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <AppText variant="caption" tone="muted">
            Hướng dẫn · {index + 1}/{steps.length}
          </AppText>
          <AppText variant="heading" style={{ marginVertical: spacing.xs }}>
            {step.title}
          </AppText>
          <AppText>{step.body}</AppText>
          {step.href ? (
            <Button
              title="Mở ngay"
              size="sm"
              variant="ghost"
              icon="arrow-forward"
              onPress={() => step.href && onOpen(step.href)}
              style={{ alignSelf: "flex-start", marginTop: spacing.sm }}
            />
          ) : null}
          <Notice
            message={
              failed
                ? "Chưa lưu được trạng thái hướng dẫn. Kiểm tra kết nối rồi thử lại."
                : null
            }
          />
          <Row
            style={{ justifyContent: "space-between", marginTop: spacing.md }}
          >
            <Button
              title="Bỏ qua"
              size="sm"
              variant="ghost"
              disabled={busy}
              onPress={onFinish}
            />
            <Row gap={spacing.xs}>
              {index > 0 ? (
                <Button
                  title="Trước"
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onPress={() => setIndex(index - 1)}
                />
              ) : null}
              <Button
                title={last ? "Xong" : "Tiếp"}
                size="sm"
                loading={busy && last}
                onPress={() => (last ? onFinish() : setIndex(index + 1))}
              />
            </Row>
          </Row>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    backgroundColor: "rgba(18,26,51,0.45)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
