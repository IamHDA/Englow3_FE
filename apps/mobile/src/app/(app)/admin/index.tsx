import { Stack, router, type Href } from "expo-router";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  useAdminOverviewQuery,
  useAssessmentWorkloadQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Card,
  ListItem,
  Row,
  Screen,
  Section,
  type IconName,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

type Entry = {
  title: string;
  subtitle: string;
  icon: IconName;
  href?: Href;
  adminOnly?: boolean;
};

const ENTRIES: Entry[] = [
  {
    title: "Chấm bài Nói & Viết",
    subtitle: "Hàng chờ giáo viên chấm",
    icon: "school-outline",
    href: "/admin/assessments",
  },
  {
    title: "Đề Nói & Viết",
    subtitle: "Soạn, gửi duyệt, xuất bản",
    icon: "reader-outline",
    href: "/admin/assessments/tasks",
  },
  {
    title: "IELTS Full Test",
    subtitle: "Ghép đề Listening + Reading với 5 đề Nói/Viết",
    icon: "trophy-outline",
    href: "/admin/full-tests",
  },
  {
    title: "Tạo đề bằng AI",
    subtitle: "Bộ IELTS full test nháp, chờ duyệt",
    icon: "flash-outline",
    href: "/admin/generation",
  },
  {
    title: "Kiểm duyệt blog",
    subtitle: "Bài và bình luận bị báo cáo",
    icon: "flag-outline",
    href: "/admin/blog",
  },
  {
    title: "Gia sư AI",
    subtitle: "Báo cáo câu trả lời, kho kiến thức, điều khiển",
    icon: "sparkles-outline",
    href: "/admin/ai-tutor",
  },
  {
    title: "Đề thi",
    subtitle: "Soạn, gửi duyệt, xuất bản, lưu trữ",
    icon: "document-text-outline",
    href: "/admin/exams",
  },
  {
    title: "Nội dung học",
    subtitle: "Soạn và duyệt thẻ từ, quiz, nghe chép, phát âm, dịch",
    icon: "library-outline",
    href: "/admin/content",
  },
  {
    title: "Trọng số kiểm tra trình độ",
    subtitle: "Theo mục tiêu học",
    icon: "options-outline",
    href: "/admin/level-check-weights",
    adminOnly: true,
  },
  {
    title: "Quy đổi điểm TOEIC",
    subtitle: "Bảng điểm theo ngày hiệu lực",
    icon: "swap-horizontal-outline",
    href: "/admin/score-conversions",
    adminOnly: true,
  },
  {
    title: "Người dùng",
    subtitle: "Tìm kiếm, đổi vai trò",
    icon: "people-outline",
    href: "/admin/users",
    adminOnly: true,
  },
  {
    title: "Gói Pro",
    subtitle: "Cấp hoặc thu hồi gói",
    icon: "diamond-outline",
    href: "/admin/subscriptions",
    adminOnly: true,
  },
];

export default function AdminHomeScreen() {
  const { me } = useAuth();
  const overview = useAdminOverviewQuery({ fetchPolicy: "cache-and-network" });
  const workload = useAssessmentWorkloadQuery({
    fetchPolicy: "cache-and-network",
  });
  const admin = me?.role === "ADMIN";

  return (
    <Screen
      refreshing={overview.loading && Boolean(overview.data)}
      onRefresh={() => {
        void overview.refetch();
        void workload.refetch();
      }}
    >
      <Stack.Screen options={{ title: "Quản trị" }} />
      <QueryView
        loading={overview.loading}
        error={overview.error}
        data={overview.data?.adminOverview}
        onRetry={() => void overview.refetch()}
      >
        {(data) => (
          <Card style={{ marginBottom: spacing.lg }}>
            <AppText variant="caption" tone="muted">
              {data.periodDays} ngày qua
            </AppText>
            <Row
              wrap
              style={{ justifyContent: "space-between", marginTop: spacing.sm }}
            >
              <Stat value={data.learners} label="học viên" />
              <Stat value={data.newLearners} label="mới" />
              <Stat value={data.activeLearners} label="hoạt động" />
              <Stat value={data.pendingReviewTotal} label="chờ duyệt" accent />
            </Row>
            <AppText
              variant="caption"
              tone="muted"
              style={{ marginTop: spacing.sm }}
            >
              {data.cardReviews} lượt ôn thẻ · {data.dictationSentences} câu
              nghe chép · {data.quizzesSubmitted} quiz · {data.examsSubmitted}{" "}
              đề thi
            </AppText>
          </Card>
        )}
      </QueryView>

      <Section title="Việc cần làm">
        {ENTRIES.filter((entry) => admin || !entry.adminOnly).map((entry) => (
          <ListItem
            key={entry.title}
            icon={entry.icon}
            title={entry.title}
            subtitle={entry.subtitle}
            right={
              entry.href === "/admin/assessments" &&
              workload.data &&
              workload.data.assessmentWorkload.needsReview > 0 ? (
                <Badge
                  label={String(workload.data.assessmentWorkload.needsReview)}
                  tone="accent"
                />
              ) : undefined
            }
            onPress={() => entry.href && router.push(entry.href)}
          />
        ))}
      </Section>
    </Screen>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={{ alignItems: "center", minWidth: 70 }}>
      <AppText variant="heading" tone={accent ? "primary" : "default"}>
        {value}
      </AppText>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
    </View>
  );
}
