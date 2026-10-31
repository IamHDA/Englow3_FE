import type { Metadata } from "next";

import { ForgotPasswordView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Quên mật khẩu | Englow3",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  return <ForgotPasswordView expired={expired === "1"} />;
}
