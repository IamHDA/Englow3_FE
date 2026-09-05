// Chỉ những gì Client Component dùng được. Feature này chưa có phần chạy phía
// server nên không có ngoại lệ nào như `auth` và `account`.
export { OnboardingGate } from "./components/OnboardingGate";
export { OnboardingProvider } from "./components/OnboardingProvider";
export { useOnboarding } from "./hooks/useOnboarding";
export { useOnboardingGuard } from "./hooks/useOnboardingGuard";
