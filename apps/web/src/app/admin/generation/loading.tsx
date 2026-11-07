import { GenerationRequestListSkeleton } from "@/features/generation";
import { Page } from "@/shared/components/Page";

export default function Loading() {
  return (
    <Page>
      <GenerationRequestListSkeleton />
    </Page>
  );
}
