import type { Metadata } from "next";
import { AiTutorComingSoonView } from "@/features/ai-tutor";

export const metadata: Metadata = {
  title: "Gia sư AI | Englow3",
  description:
    "Gia sư AI của Englow3 đang được xây dựng - hội thoại luyện tập, chấm phát âm, chữa bài viết và giải thích đáp án.",
};

export default function AiTutorPage() {
  return <AiTutorComingSoonView />;
}
