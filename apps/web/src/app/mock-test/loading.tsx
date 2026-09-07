import { ExamLibrarySkeleton } from "@/features/exam";

export default function MockTestLoading() {
  return (
    <div
      style={{ maxWidth: 1360, margin: "0 auto", padding: "36px 24px 80px" }}
    >
      <ExamLibrarySkeleton />
    </div>
  );
}
