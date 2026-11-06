import type { Metadata } from "next";
import { AdminFullTestListView } from "@/features/fullTest";

export const metadata: Metadata = {
  title: "Full test IELTS | Englow3",
  description:
    "Soạn, gửi duyệt và phát hành full test IELTS - bài test đầu vào của học viên IELTS.",
};

export default function AdminFullTestsPage() {
  return <AdminFullTestListView />;
}
