import type { Metadata } from "next";
import { ExamSittingView, FULL_TEST_SITTING_PARAM } from "@/features/exam";

export const metadata: Metadata = {
  title: "Làm bài thi thử | Englow3",
  description:
    "Trải nghiệm thi thử chứng chỉ tiếng Anh quốc tế TOEIC, IELTS với áp lực phòng thi thực tế tại Englow3.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function MockTestDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sitting = (await searchParams)[FULL_TEST_SITTING_PARAM];
  // Only a well-formed id is passed on; anything else is an ordinary visit.
  const fullTestSittingId =
    typeof sitting === "string" && UUID.test(sitting) ? sitting : null;
  return <ExamSittingView examId={id} fullTestSittingId={fullTestSittingId} />;
}
