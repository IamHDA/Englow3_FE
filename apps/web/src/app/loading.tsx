import { PageLoader } from "@/shared/components/PageLoader";

/**
 * What any route without a loading screen of its own shows while its server
 * part renders: the tutor, flashcard study, dictation review, the auth pages.
 * Routes with a skeleton keep theirs - a skeleton in the shape of the page
 * beats a spinner wherever the shape is known.
 */
export default function Loading() {
  return <PageLoader />;
}
