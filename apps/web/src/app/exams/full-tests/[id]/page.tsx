import { FullTestStartView } from "@/features/fullTest";

export const metadata = { title: "IELTS Full Test — Englow3" };

export default async function FullTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FullTestStartView fullTestId={id} />;
}
