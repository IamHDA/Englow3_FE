import type { Metadata } from "next";
import { AuthErrorView } from "@/features/auth/components/views/AuthErrorView";

export const metadata: Metadata = { title: "Xác thực tài khoản | Englow3" };

export default function AuthErrorPage() {
  return <AuthErrorView />;
}
