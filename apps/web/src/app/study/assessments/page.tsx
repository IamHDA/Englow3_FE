import { AssessmentHistory } from "@/features/assessment/components/AssessmentHistory";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
  return <AssessmentHistory initial={initial} />;
}
