import type { Metadata } from "next";
import { PronunciationLibraryView } from "@/features/pronunciation";

export const metadata: Metadata = {
  title: "Luyện phát âm chuẩn AI | Englow3",
  description:
    "Phân tích giọng nói theo thời gian thực, đối chiếu khẩu hình với người bản xứ và chấm điểm chi tiết từng âm vị chuẩn quốc tế IPA.",
};

export default function PronunciationPage() {
  return <PronunciationLibraryView />;
}
