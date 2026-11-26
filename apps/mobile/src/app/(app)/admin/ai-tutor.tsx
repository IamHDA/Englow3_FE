import { Stack } from "expo-router";
import { useState } from "react";

import {
  TutorPolicyPanel,
  TutorOperationsPanel,
} from "@/features/admin/tutor/TutorPolicyPanel";
import { TutorReportsPanel } from "@/features/admin/tutor/TutorReportsPanel";
import { TutorResourcesPanel } from "@/features/admin/tutor/TutorResourcesPanel";
import { useAuth } from "@/features/auth/AuthProvider";
import { AppText, Chip, ChipRow, Screen } from "@/ui/components";
import { spacing } from "@/ui/theme";

type Tab = "reports" | "resources" | "settings";

/** AI tutor back office, as the web's TutorManagementView. */
export default function AdminTutorScreen() {
  const { me } = useAuth();
  const admin = me?.role === "ADMIN";
  const [tab, setTab] = useState<Tab>("reports");

  return (
    <Screen>
      <Stack.Screen options={{ title: "Gia sư AI" }} />
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginBottom: spacing.sm }}
      >
        {admin
          ? "Duyệt học liệu và kết luận các báo cáo về câu trả lời của gia sư."
          : "Soạn học liệu và xử lý các báo cáo được phân công. Bạn chỉ xem phần hội thoại liên quan đến báo cáo."}
      </AppText>
      <ChipRow>
        <Chip
          label="Báo cáo câu trả lời"
          selected={tab === "reports"}
          onPress={() => setTab("reports")}
        />
        <Chip
          label="Kho kiến thức"
          selected={tab === "resources"}
          onPress={() => setTab("resources")}
        />
        {admin ? (
          <Chip
            label="Điều khiển & hàng đợi"
            selected={tab === "settings"}
            onPress={() => setTab("settings")}
          />
        ) : null}
      </ChipRow>
      {tab === "reports" ? <TutorReportsPanel admin={admin} /> : null}
      {tab === "resources" ? <TutorResourcesPanel /> : null}
      {tab === "settings" && admin ? (
        <>
          <TutorPolicyPanel />
          <TutorOperationsPanel />
        </>
      ) : null}
    </Screen>
  );
}
