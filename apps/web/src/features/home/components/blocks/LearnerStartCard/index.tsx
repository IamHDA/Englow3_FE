"use client";

import {
  Alert,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ClipboardCheck, CircleHelp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAccountProfile } from "@/features/account";
import { useOnboarding } from "@/features/onboarding";
import { useUserTour } from "@/features/tour";
import { Role } from "@/lib/graphql/generated";
import { usePlacementExamLazyQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

export function LearnerStartCard() {
  const { profile, loading, hasError, refresh } = useAccountProfile();
  const { requiresOnboarding, open, close } = useOnboarding();
  const { canReplay, replay } = useUserTour();
  const { isVi } = useLanguage();
  const router = useRouter();
  const [loadPlacement] = usePlacementExamLazyQuery({
    fetchPolicy: "network-only",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const tr = (vi: string, en: string) => (isVi ? vi : en);

  async function startPlacement() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const { data, error } = await loadPlacement();
      if (error) throw error;
      if (!data?.placementExam?.id) throw new Error("Missing placement paper");
      close();
      router.push(`/exams/${data.placementExam.id}`);
    } catch (error) {
      setError(
        backendCodeOf(error) === "PLACEMENT_EXAM_NOT_FOUND"
          ? tr(
              "Chưa có đề kiểm tra đầu vào được phát hành. Bạn vẫn có thể tự chọn trình độ khi thiết lập mục tiêu và quay lại làm bài sau.",
              "No placement test has been published yet. You can choose your level during goal setup and take the test later.",
            )
          : tr(
              "Chưa tải được bài kiểm tra. Hãy thử lại khi kết nối ổn định.",
              "Could not load the placement test. Please check your connection and try again.",
            ),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (loading && !profile)
    return (
      <Card withBorder radius="lg" p="lg">
        <Group wrap="nowrap" role="status">
          <Loader size="sm" aria-hidden="true" />
          <Text>
            {tr(
              "Đang tải hướng dẫn và thiết lập tài khoản…",
              "Loading your guide and account setup…",
            )}
          </Text>
        </Group>
      </Card>
    );
  if (hasError && !profile)
    return (
      <Alert
        color="orange"
        title={tr(
          "Chưa tải được thiết lập Learner",
          "Could not load learner setup",
        )}
      >
        <Stack gap="sm">
          <Text size="sm">
            {tr(
              "Hướng dẫn và bài test đầu vào sẽ xuất hiện khi tải lại được hồ sơ.",
              "Your guide and placement test will appear when your profile loads.",
            )}
          </Text>
          <Button variant="light" onClick={() => void refresh()}>
            {tr("Thử tải lại hồ sơ", "Reload profile")}
          </Button>
        </Stack>
      </Alert>
    );
  if (profile?.role !== Role.LEARNER) return null;
  return (
    <Card withBorder radius="lg" p="lg">
      <Stack gap="md">
        <Title order={2} size="h3" c="navy.9">
          {tr("Bắt đầu cùng Englow3", "Get started with Englow3")}
        </Title>
        {requiresOnboarding && (
          <Group justify="space-between" gap="sm">
            <Text size="sm">
              {tr(
                "Hoàn tất mục tiêu học và chọn trình độ để cá nhân hóa lộ trình.",
                "Finish setting your goals and level to personalize your learning path.",
              )}
            </Text>
            <Button color="orange.5" onClick={open}>
              {tr("Tiếp tục thiết lập", "Continue setup")}
            </Button>
          </Group>
        )}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Stack gap="xs" align="flex-start">
            <Text fw={700}>{tr("Hướng dẫn sử dụng web", "Website guide")}</Text>
            <Text size="sm" c="ink.7">
              {tr(
                "Khám phá lộ trình, bài luyện, gia sư AI và cách xem kết quả.",
                "Explore your daily path, practice, AI tutor and results.",
              )}
            </Text>
            <Button
              variant="light"
              leftSection={<CircleHelp size={18} aria-hidden="true" />}
              disabled={!canReplay}
              onClick={replay}
            >
              {tr("Xem hướng dẫn", "Open guide")}
            </Button>
            {requiresOnboarding && (
              <Text size="sm" c="ink.7">
                {tr(
                  "Hướng dẫn tự mở sau khi hoàn tất thiết lập.",
                  "The guide opens automatically after setup.",
                )}
              </Text>
            )}
          </Stack>
          <Stack gap="xs" align="flex-start">
            <Text fw={700}>{tr("Bài kiểm tra đầu vào", "Placement test")}</Text>
            <Text size="sm" c="ink.7">
              {tr(
                "Kiểm tra trình độ hiện tại trước khi học hoặc đánh giá lại sau một thời gian luyện tập.",
                "Check your current level before learning, or reassess it after practising.",
              )}
            </Text>
            <Button
              color="teal"
              leftSection={<ClipboardCheck size={18} aria-hidden="true" />}
              loading={pending}
              onClick={() => void startPlacement()}
            >
              {tr("Làm bài test đầu vào", "Take placement test")}
            </Button>
          </Stack>
        </SimpleGrid>
        {error && (
          <Alert color="orange" role="alert">
            {error}
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
