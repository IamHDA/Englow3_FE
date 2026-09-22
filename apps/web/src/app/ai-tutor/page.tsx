import type { Metadata } from "next";
import { AiTutorView } from "@/features/ai-tutor";

export const metadata: Metadata = {
  title: "Gia sư AI | Englow3",
  description:
    "Hỏi gia sư AI của Englow3 về từ vựng, ngữ pháp và phát âm, hoặc nhờ sửa câu.",
};

export default function AiTutorPage() {
  return <AiTutorView />;
}
