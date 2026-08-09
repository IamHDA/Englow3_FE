import { HeroSection } from "../blocks/HeroSection";
import { LearnerStats } from "../blocks/LearnerStats";

export function HomeView() {
  return (
    <div className="flex-1 bg-neutral-100">
      <div className="mx-auto w-full max-w-7xl px-6 pb-10 lg:px-8 lg:pb-12">
        <HeroSection />
        <div className="mt-10">
          <LearnerStats />
        </div>
      </div>
    </div>
  );
}
