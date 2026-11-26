import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  CEFR_LABELS,
  CEFR_ORDER,
  CERTIFICATE_SCORE_RANGE,
  SKILL_LABELS,
} from "@/features/shared/labels";
import { backendCodeOf, errorMessage } from "@/lib/errors";
import {
  CefrLevel,
  CertificateVariant,
  LearningSkill,
  LevelCheckPurpose,
  OnboardingStep,
  TargetCertificate,
  useCompleteOnboardingMutation,
  useCreateRoadmapMutation,
  useLearningPurposesQuery,
  usePlacementExamLazyQuery,
  usePlacementFullTestsLazyQuery,
  useSelectLearningPurposesMutation,
  useSelectTargetSkillsMutation,
  useSetCertificateTargetMutation,
  useSetCurrentLevelMutation,
  useSetLearningGoalMutation,
  useStartLevelCheckMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Choice,
  Notice,
  Row,
  Screen,
  Spacer,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const STEP_ORDER = [
  OnboardingStep.LEARNING_PURPOSES,
  OnboardingStep.CERTIFICATE_TARGET,
  OnboardingStep.CURRENT_LEVEL,
  OnboardingStep.LEARNING_GOAL,
  OnboardingStep.TARGET_SKILLS,
];

const ONBOARDING_ERRORS: Record<string, string> = {
  ONBOARDING_PURPOSE_REQUIRED: "Hãy chọn ít nhất một mục tiêu học.",
  TARGET_LEVEL_NOT_ABOVE_CURRENT:
    "Trình độ mục tiêu phải cao hơn trình độ hiện tại.",
  PLACEMENT_EXAM_NOT_FOUND:
    "Chưa có bài kiểm tra xếp trình độ. Hãy tự chọn trình độ của bạn.",
  PLACEMENT_NOT_AVAILABLE:
    "Chưa có bài kiểm tra xếp trình độ. Hãy tự chọn trình độ của bạn.",
  QUIZ_NOT_AVAILABLE:
    "Chưa có bài kiểm tra xếp trình độ. Hãy tự chọn trình độ của bạn.",
};

/**
 * The five set-up questions. The backend decides which step comes next and
 * returns it with every answer; the profile is re-read so the whole app sees
 * the new state.
 */
export default function OnboardingScreen() {
  const { me, refetchMe } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [selectPurposes, purposesState] = useSelectLearningPurposesMutation();
  const [setCertificate, certificateState] = useSetCertificateTargetMutation();
  const [setLevel, levelState] = useSetCurrentLevelMutation();
  const [setGoal, goalState] = useSetLearningGoalMutation();
  const [selectSkills, skillsState] = useSelectTargetSkillsMutation();
  const [complete, completeState] = useCompleteOnboardingMutation();
  const [createRoadmap] = useCreateRoadmapMutation();
  const [loadPlacement, placementState] = usePlacementExamLazyQuery({
    fetchPolicy: "network-only",
  });
  const [loadFullTests, fullTestsState] = usePlacementFullTestsLazyQuery({
    fetchPolicy: "network-only",
  });
  const [startLevelCheck, levelCheckState] = useStartLevelCheckMutation();

  const pending =
    purposesState.loading ||
    certificateState.loading ||
    levelState.loading ||
    goalState.loading ||
    skillsState.loading ||
    completeState.loading;
  const startingTest =
    placementState.loading || fullTestsState.loading || levelCheckState.loading;

  if (!me) return null;
  const step = me.onboardingStep;
  const state = me.onboardingState;

  if (step === OnboardingStep.COMPLETED) {
    return (
      <Screen>
        <AppText variant="heading">Lộ trình của bạn đã sẵn sàng 🎉</AppText>
        <AppText tone="muted" style={{ marginVertical: spacing.md }}>
          Englow3 sẽ gợi ý bài học mỗi ngày theo mục tiêu bạn vừa chọn.
        </AppText>
        <Button title="Bắt đầu học" onPress={() => router.back()} />
      </Screen>
    );
  }

  async function run(mutate: () => Promise<unknown>) {
    setError(null);
    try {
      await mutate();
      await refetchMe();
    } catch (failure) {
      setError(errorMessage(failure, ONBOARDING_ERRORS));
    }
  }

  function leaveFor(href: Parameters<typeof router.push>[0]) {
    router.back();
    router.push(href);
  }

  async function takePlacementTest() {
    setError(null);
    try {
      if (state?.targetCertificateType === TargetCertificate.IELTS) {
        const tests = (await loadFullTests()).data?.fullTests ?? [];
        const chosen =
          tests.find(
            (test) => test.certificateVariant === CertificateVariant.ACADEMIC,
          ) ?? tests[0];
        if (chosen) {
          leaveFor({
            pathname: "/exams/full-tests/[id]",
            params: { id: chosen.id },
          });
          return;
        }
      }
      if (state?.certificateLearner) {
        const placement = await loadPlacement();
        if (placement.data) {
          leaveFor({
            pathname: "/exams/[id]",
            params: { id: placement.data.placementExam.id },
          });
        } else {
          setError(
            ONBOARDING_ERRORS[backendCodeOf(placement.error) ?? ""] ??
              errorMessage(placement.error),
          );
        }
        return;
      }
      await startLevelCheck({
        variables: { purpose: LevelCheckPurpose.ONBOARDING },
      });
      leaveFor("/study/level-check");
    } catch (failure) {
      setError(errorMessage(failure, ONBOARDING_ERRORS));
    }
  }

  const visibleSteps = STEP_ORDER.filter(
    (item) =>
      item !== OnboardingStep.CERTIFICATE_TARGET || state?.certificateLearner,
  );
  const stepNumber = Math.max(1, visibleSteps.indexOf(step) + 1);

  return (
    <Screen>
      <Row
        style={{ justifyContent: "space-between", marginBottom: spacing.md }}
      >
        <Badge label={`Bước ${stepNumber}/${visibleSteps.length}`} />
        <Button
          title="Để sau"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        />
      </Row>
      <Notice message={error} />

      {step === OnboardingStep.LEARNING_PURPOSES ? (
        <PurposesStep
          pending={pending}
          onContinue={(purposeIds) =>
            run(() => selectPurposes({ variables: { purposeIds } }))
          }
        />
      ) : null}

      {step === OnboardingStep.CERTIFICATE_TARGET ? (
        <CertificateStep
          initial={
            (state?.targetCertificateType as TargetCertificate | null) ?? null
          }
          pending={pending}
          onContinue={(certificateType) =>
            run(() => setCertificate({ variables: { certificateType } }))
          }
        />
      ) : null}

      {step === OnboardingStep.CURRENT_LEVEL ? (
        <CurrentLevelStep
          initial={state?.currentLevel ?? null}
          pending={pending}
          startingTest={startingTest}
          certificateLearner={Boolean(state?.certificateLearner)}
          onContinue={(level) => run(() => setLevel({ variables: { level } }))}
          onTakeTest={takePlacementTest}
        />
      ) : null}

      {step === OnboardingStep.LEARNING_GOAL ? (
        <LearningGoalStep
          certificateLearner={Boolean(state?.certificateLearner)}
          certificate={
            (state?.targetCertificateType as TargetCertificate | null) ??
            TargetCertificate.IELTS
          }
          currentLevel={state?.currentLevel ?? null}
          initialScore={state?.targetScore ?? null}
          initialDate={state?.targetDate ?? null}
          initialLevel={state?.targetLevel ?? null}
          initialMinutes={state?.dailyStudyMinutes ?? null}
          pending={pending}
          onContinue={(input) => run(() => setGoal({ variables: { input } }))}
        />
      ) : null}

      {step === OnboardingStep.TARGET_SKILLS ? (
        <TargetSkillsStep
          initial={state?.targetSkills ?? []}
          pending={pending}
          onContinue={(skills) =>
            run(async () => {
              await selectSkills({ variables: { skills } });
              const { data } = await complete();
              const done = data?.completeOnboarding;
              const hasGoal = done
                ? done.certificateLearner
                  ? done.targetScore != null
                  : done.targetLevel != null
                : false;
              // The roadmap is a convenience; onboarding is finished either way.
              if (hasGoal) void createRoadmap().catch(() => undefined);
            })
          }
        />
      ) : null}
    </Screen>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <AppText variant="heading">{title}</AppText>
      <AppText tone="muted">{subtitle}</AppText>
    </View>
  );
}

function PurposesStep({
  pending,
  onContinue,
}: {
  pending: boolean;
  onContinue: (ids: number[]) => void;
}) {
  const purposes = useLearningPurposesQuery();
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <>
      <StepTitle
        title="Mục tiêu học tiếng Anh của bạn là gì?"
        subtitle="Điều này giúp chúng tôi cá nhân hoá lộ trình học hằng ngày cho bạn. Có thể chọn nhiều mục."
      />
      <QueryView
        loading={purposes.loading}
        error={purposes.error}
        data={purposes.data?.learningPurposes}
        onRetry={() => void purposes.refetch()}
      >
        {(items) =>
          items.map((purpose) => (
            <Choice
              key={purpose.id}
              label={purpose.displayName}
              selected={selected.includes(purpose.id)}
              onPress={() =>
                setSelected((current) =>
                  current.includes(purpose.id)
                    ? current.filter((id) => id !== purpose.id)
                    : [...current, purpose.id],
                )
              }
            />
          ))
        }
      </QueryView>
      <Spacer />
      <Button
        title="Tiếp tục"
        loading={pending}
        disabled={selected.length === 0}
        onPress={() => onContinue(selected)}
      />
    </>
  );
}

function CertificateStep({
  initial,
  pending,
  onContinue,
}: {
  initial: TargetCertificate | null;
  pending: boolean;
  onContinue: (certificate: TargetCertificate) => void;
}) {
  const [selected, setSelected] = useState<TargetCertificate | null>(initial);
  return (
    <>
      <StepTitle
        title="Bạn muốn luyện chứng chỉ nào?"
        subtitle="Lộ trình sẽ bám theo định dạng đề của chứng chỉ này."
      />
      {[TargetCertificate.IELTS, TargetCertificate.TOEIC].map((certificate) => (
        <Choice
          key={certificate}
          label={certificate}
          selected={selected === certificate}
          onPress={() => setSelected(certificate)}
        />
      ))}
      <Spacer />
      <Button
        title="Tiếp tục"
        loading={pending}
        disabled={!selected}
        onPress={() => selected && onContinue(selected)}
      />
    </>
  );
}

function CurrentLevelStep({
  initial,
  pending,
  startingTest,
  certificateLearner,
  onContinue,
  onTakeTest,
}: {
  initial: CefrLevel | null;
  pending: boolean;
  startingTest: boolean;
  certificateLearner: boolean;
  onContinue: (level: CefrLevel) => void;
  onTakeTest: () => void;
}) {
  const [selected, setSelected] = useState<CefrLevel | null>(initial);
  return (
    <>
      <StepTitle
        title="Trình độ hiện tại của bạn?"
        subtitle="Chọn mức gần đúng nhất, hoặc làm bài kiểm tra để Englow3 xếp trình độ cho bạn."
      />
      {CEFR_ORDER.map((level) => (
        <Choice
          key={level}
          label={`${CEFR_LABELS[level].label} · ${CEFR_LABELS[level].description}`}
          selected={selected === level}
          onPress={() => setSelected(level)}
        />
      ))}
      <Spacer />
      <Button
        title="Tiếp tục"
        loading={pending}
        disabled={!selected || startingTest}
        onPress={() => selected && onContinue(selected)}
      />
      <Spacer size={spacing.sm} />
      <Button
        title={
          certificateLearner
            ? "Làm bài kiểm tra xếp trình độ"
            : "Làm bài kiểm tra trình độ"
        }
        variant="secondary"
        icon="clipboard-outline"
        loading={startingTest}
        disabled={pending}
        onPress={onTakeTest}
      />
    </>
  );
}

function LearningGoalStep({
  certificateLearner,
  certificate,
  currentLevel,
  initialScore,
  initialDate,
  initialLevel,
  initialMinutes,
  pending,
  onContinue,
}: {
  certificateLearner: boolean;
  certificate: TargetCertificate;
  currentLevel: CefrLevel | null;
  initialScore: number | null;
  initialDate: string | null;
  initialLevel: CefrLevel | null;
  initialMinutes: number | null;
  pending: boolean;
  onContinue: (input: {
    certificateType: TargetCertificate;
    targetScore: number | null;
    targetDate: string | null;
    targetLevel: CefrLevel | null;
    dailyStudyMinutes: number | null;
  }) => void;
}) {
  const levelChoices = CEFR_ORDER.filter(
    (level) =>
      currentLevel == null ||
      CEFR_ORDER.indexOf(level) > CEFR_ORDER.indexOf(currentLevel),
  );
  const [score, setScore] = useState(
    initialScore == null ? "" : String(initialScore),
  );
  const [date, setDate] = useState(initialDate ?? "");
  const [level, setLevel] = useState<CefrLevel | null>(initialLevel);
  const [minutes, setMinutes] = useState(
    initialMinutes == null ? "30" : String(initialMinutes),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const range = CERTIFICATE_SCORE_RANGE[certificate];

  function submit() {
    const next: Record<string, string> = {};
    const scoreValue = score.trim() === "" ? null : Number(score);
    if (certificateLearner) {
      if (scoreValue == null)
        next.score = `Lộ trình cần mốc điểm đích. Thang ${certificate}: ${range.min} - ${range.max}.`;
      else if (
        Number.isNaN(scoreValue) ||
        scoreValue < range.min ||
        scoreValue > range.max
      )
        next.score = `Điểm ${certificate} từ ${range.min} đến ${range.max}.`;
      else if (Math.round(scoreValue / range.step) * range.step !== scoreValue)
        next.score = `Điểm ${certificate} theo bước ${range.step}.`;
    } else if (levelChoices.length > 0 && !level) {
      next.level = "Chọn trình độ bạn muốn đạt";
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      next.date = "Ngày theo dạng YYYY-MM-DD.";
    else if (date && date <= new Date().toISOString().slice(0, 10))
      next.date = "Ngày mục tiêu phải ở tương lai.";
    const minutesValue = minutes.trim() === "" ? null : Number(minutes);
    if (
      minutesValue != null &&
      (!Number.isInteger(minutesValue) ||
        minutesValue < 10 ||
        minutesValue > 240)
    )
      next.minutes = "Thời gian học mỗi ngày từ 10 đến 240 phút";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onContinue({
      certificateType: certificate,
      targetScore: certificateLearner ? scoreValue : null,
      targetDate: date || null,
      targetLevel: certificateLearner ? null : level,
      dailyStudyMinutes: minutesValue,
    });
  }

  return (
    <>
      <StepTitle
        title="Đặt mục tiêu cho lộ trình"
        subtitle="Englow3 chia lộ trình thành từng giai đoạn để bạn đạt mục tiêu đúng hạn."
      />
      {certificateLearner ? (
        <TextField
          label={`Điểm ${certificate} mục tiêu`}
          value={score}
          onChangeText={setScore}
          keyboardType="decimal-pad"
          hint={`Thang ${range.min} - ${range.max}`}
          error={errors.score}
        />
      ) : levelChoices.length > 0 ? (
        <>
          <AppText variant="label" style={{ marginBottom: spacing.xs }}>
            Trình độ muốn đạt
          </AppText>
          {levelChoices.map((choice) => (
            <Choice
              key={choice}
              label={CEFR_LABELS[choice].label}
              selected={level === choice}
              onPress={() => setLevel(choice)}
            />
          ))}
          {errors.level ? (
            <AppText variant="caption" tone="danger">
              {errors.level}
            </AppText>
          ) : null}
          <Spacer />
        </>
      ) : null}
      <TextField
        label="Ngày muốn đạt (không bắt buộc)"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        error={errors.date}
      />
      <TextField
        label="Số phút học mỗi ngày"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
        hint="Từ 10 đến 240 phút"
        error={errors.minutes}
      />
      <Button title="Tiếp tục" loading={pending} onPress={submit} />
    </>
  );
}

function TargetSkillsStep({
  initial,
  pending,
  onContinue,
}: {
  initial: LearningSkill[];
  pending: boolean;
  onContinue: (skills: LearningSkill[]) => void;
}) {
  const [selected, setSelected] = useState<LearningSkill[]>(initial);
  return (
    <>
      <StepTitle
        title="Bạn muốn tập trung kỹ năng nào?"
        subtitle="Chọn một hoặc nhiều kỹ năng."
      />
      {(Object.keys(SKILL_LABELS) as LearningSkill[]).map((skill) => (
        <Choice
          key={skill}
          label={SKILL_LABELS[skill]}
          selected={selected.includes(skill)}
          onPress={() =>
            setSelected((current) =>
              current.includes(skill)
                ? current.filter((item) => item !== skill)
                : [...current, skill],
            )
          }
        />
      ))}
      <Spacer />
      <Button
        title="Hoàn tất"
        loading={pending}
        disabled={selected.length === 0}
        onPress={() => onContinue(selected)}
      />
    </>
  );
}
