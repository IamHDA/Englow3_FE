import type { Gender, OnboardingStep, Role } from "../../generated/graphql.js";

// mirrors GET /api/user/me exactly as the backend returns it
export type UserInformationResponse = {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  gender: Gender | null;
  birthDate: string | null; // "YYYY-MM-DD"
  avatarUrl: string | null;
  bannerUrl: string | null;
  onboardingStep: OnboardingStep;
  role: Role;
};
