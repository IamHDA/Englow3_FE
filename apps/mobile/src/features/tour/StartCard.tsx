import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { backendCodeOf } from "@/lib/errors";
import {
  OnboardingStep,
  usePlacementExamLazyQuery,
} from "@/lib/graphql/generated";
import { AppText, Button, Card, Notice } from "@/ui/components";
import { spacing } from "@/ui/theme";

import { useTour } from "./TourProvider";

/**
 * "Get started" on a learner's home, as the web's LearnerStartCard: the guide,
 * and the placement test until a placement result is on record.
 */
export function StartCard() {
  const { me } = useAuth();
  const { canReplay, replay } = useTour();
  const [loadPlacement] = usePlacementExamLazyQuery({
    fetchPolicy: "network-only",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  if (me?.role !== "LEARNER") return null;
  const setupDone = me.onboardingStep === OnboardingStep.COMPLETED;
  // Setup is done and the level measured: nothing here is still to do.
  if (me.onboardingState?.placementAttemptId && setupDone) return null;

  async function startPlacement() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const { data, error: failure } = await loadPlacement();
      if (failure) throw failure;
      const id = data?.placementExam?.id;
      if (!id) throw new Error("Missing placement paper");
      router.push({ pathname: "/exams/[id]", params: { id } });
    } catch (failure) {
      setError(
        backendCodeOf(failure) === "PLACEMENT_EXAM_NOT_FOUND"
          ? "Chưa có đề kiểm tra đầu vào được phát hành. Bạn vẫn có thể tự chọn trình độ khi thiết lập mục tiêu và quay lại làm bài sau."
          : "Chưa tải được bài kiểm tra. Hãy thử lại khi kết nối ổn định.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <Card style={{ marginBottom: spacing.lg }}>
      <AppText variant="heading">Bắt đầu cùng Englow3</AppText>
      <View style={{ marginTop: spacing.sm }}>
        <AppText variant="label">Hướng dẫn sử dụng</AppText>
        <AppText variant="caption" tone="muted">
          Khám phá lộ trình, bài luyện, gia sư AI và cách xem kết quả.
        </AppText>
        <Button
          title="Xem hướng dẫn"
          icon="help-circle-outline"
          size="sm"
          variant="secondary"
          disabled={!canReplay}
          onPress={replay}
          style={{ alignSelf: "flex-start", marginTop: spacing.xs }}
        />
        {!setupDone ? (
          <AppText variant="caption" tone="muted">
            Hướng dẫn tự mở sau khi hoàn tất thiết lập.
          </AppText>
        ) : null}
      </View>
      {!me.onboardingState?.placementAttemptId ? (
        <View style={{ marginTop: spacing.md }}>
          <AppText variant="label">Bài kiểm tra đầu vào</AppText>
          <AppText variant="caption" tone="muted">
            Kiểm tra trình độ hiện tại trước khi học hoặc đánh giá lại sau một
            thời gian luyện tập.
          </AppText>
          <Button
            title="Làm bài kiểm tra đầu vào"
            icon="school-outline"
            size="sm"
            loading={pending}
            onPress={() => void startPlacement()}
            style={{ alignSelf: "flex-start", marginTop: spacing.xs }}
          />
          <Notice message={error} />
        </View>
      ) : null}
    </Card>
  );
}
