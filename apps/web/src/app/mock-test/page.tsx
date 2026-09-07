import type { Metadata } from "next";
import { ExamLibraryView } from "@/features/exam";

export const metadata: Metadata = {
  title: "Thư viện đề thi — Englow3",
  description:
    "Luyện thi thử IELTS & TOEIC format chuẩn ETS và Cambridge với chấm điểm tự động và phân tích chi tiết.",
};

export default function MockTestPage() {
  return <ExamLibraryView />;
}
