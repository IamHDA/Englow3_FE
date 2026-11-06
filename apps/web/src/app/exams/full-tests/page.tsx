import type { Metadata } from "next";
import { FullTestLibraryView } from "@/features/fullTest";

export const metadata: Metadata = {
  title: "IELTS Full Test — Englow3",
  description:
    "Làm IELTS full test 4 kỹ năng và nhận band tổng ước tính như thi thật.",
};

export default function FullTestsPage() {
  return <FullTestLibraryView />;
}
