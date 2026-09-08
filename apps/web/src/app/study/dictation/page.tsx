import type { Metadata } from "next";
import { DictationLibraryView } from "@/features/dictation";

export const metadata: Metadata = {
  title: "Luyện nghe chép chính tả | Englow3",
  description:
    "Luyện nghe và chép chính tả tiếng Anh theo từng cấp độ, đối chiếu kết quả theo thời gian thực và theo dõi tiến độ học tập.",
};

interface DictationPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function DictationPage({ searchParams }: DictationPageProps) {
  const { tab } = await searchParams;
  const initialTab = tab === "stats" ? "stats" : "lessons";

  return <DictationLibraryView initialTab={initialTab} />;
}
