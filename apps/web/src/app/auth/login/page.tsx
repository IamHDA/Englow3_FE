import type { Metadata } from "next";
import { LoginView } from "@/features/auth/components/views/LoginView";

export const metadata: Metadata = { title: "Đăng nhập | Englow3" };
export default function LoginPage() {
  return <LoginView />;
}
