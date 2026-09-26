export type Gender = "MALE" | "FEMALE" | "OTHER";

export type OnboardingStep =
  | "LEARNING_PURPOSES"
  | "CERTIFICATE_TARGET"
  | "CURRENT_LEVEL"
  | "LEARNING_GOAL"
  | "TARGET_SKILLS"
  | "COMPLETED";

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
};

// mirrors PUT /api/user/me/profile request body
export type UpdateProfileInput = {
  fullName: string;
  displayName: string;
  gender?: Gender | null;
  birthDate?: string | null; // "YYYY-MM-DD"
};
