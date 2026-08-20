import { HomeView } from "@/features/home";
import { OnboardingGate } from "@/features/onboarding";

export default function HomePage() {
  return (
    <>
      <HomeView />
      {/* Tự mở khi người đã đăng nhập chưa đi hết onboarding; im lặng với khách. */}
      <OnboardingGate />
    </>
  );
}
