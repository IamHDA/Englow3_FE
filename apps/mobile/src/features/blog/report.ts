import { Alert } from "react-native";

import { BlogReportReason } from "@/lib/graphql/generated";

const REASONS: { reason: BlogReportReason; label: string }[] = [
  { reason: BlogReportReason.SPAM, label: "Spam / quảng cáo" },
  { reason: BlogReportReason.HARASSMENT, label: "Quấy rối, xúc phạm" },
  { reason: BlogReportReason.INAPPROPRIATE, label: "Nội dung không phù hợp" },
  { reason: BlogReportReason.MISINFORMATION, label: "Thông tin sai" },
  { reason: BlogReportReason.OTHER, label: "Lý do khác" },
];

/** Asks why, with a native sheet that works on both platforms. */
export function askReportReason(onPick: (reason: BlogReportReason) => void) {
  Alert.alert("Báo cáo vì…", undefined, [
    ...REASONS.map((item) => ({
      text: item.label,
      onPress: () => onPick(item.reason),
    })),
    { text: "Huỷ", style: "cancel" as const },
  ]);
}
