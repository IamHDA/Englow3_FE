import { getServerSession } from "@/features/auth/server/getServerSession";
import { HomeView, LearnerHomeView } from "@/features/home";

/**
 * One address, two pages: someone deciding whether to sign up sees what
 * Englow3 is; someone who has sees where they left off.
 */
export default async function HomePage() {
  const session = await getServerSession();
  return session ? <LearnerHomeView /> : <HomeView />;
}
