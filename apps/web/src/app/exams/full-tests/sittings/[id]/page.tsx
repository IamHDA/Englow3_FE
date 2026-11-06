import { FullTestSittingView } from "@/features/fullTest";

export const metadata = { title: "Lượt IELTS Full Test — Englow3" };

export default async function FullTestSittingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FullTestSittingView sittingId={id} />;
}
