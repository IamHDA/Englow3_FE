import { redirect } from "next/navigation";

import { ResetPasswordView } from "@/features/auth";
import { getServerSession } from "@/features/auth/server/getServerSession";

export default async function ResetPasswordPage() {
  // The reset link signs the learner in for exactly this. Without that session
  // (the page opened directly, or the link expired) the form could only fail,
  // so ask for a new link instead.
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/forgot?expired=1");
  }
  return <ResetPasswordView />;
}
