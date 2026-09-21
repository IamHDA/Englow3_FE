import type { Metadata } from "next";
import { AdminExamListView } from "@/features/exam";

export const metadata: Metadata = {
  title: "Quản lý đề thi | Englow3",
  description:
    "Danh sách đề thi dành cho quản trị viên: lọc theo trạng thái, phát hành và lưu trữ.",
};

export default function AdminExamsPage() {
  return <AdminExamListView />;
}
