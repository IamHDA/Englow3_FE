import type { Metadata } from "next";
import { ExamLibraryView } from "@/features/exam";

export const metadata: Metadata = {
  title: "Thư viện đề thi — Englow3",
  description:
    "Luyện thi thử IELTS & TOEIC format chuẩn ETS và Cambridge với chấm điểm tự động và phân tích chi tiết.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MockTestPage({ searchParams }: PageProps) {
  const tab = (await searchParams).tab;
  return (
    <ExamLibraryView initialTabId={typeof tab === "string" ? tab : null} />
  );
}
