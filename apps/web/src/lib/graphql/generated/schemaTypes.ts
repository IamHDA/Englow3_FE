export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: unknown; output: unknown };
};

export enum CefrLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
  OTHER = "OTHER",
}

export enum LearningSkill {
  GRAMMAR = "GRAMMAR",
  LISTENING = "LISTENING",
  PRONUNCIATION = "PRONUNCIATION",
  READING = "READING",
  SPEAKING = "SPEAKING",
  VOCABULARY = "VOCABULARY",
  WRITING = "WRITING",
}

export type Me = {
  __typename?: "Me";
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  bannerUrl?: Maybe<Scalars["String"]["output"]>;
  birthDate?: Maybe<Scalars["Date"]["output"]>;
  displayName: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  fullName: Scalars["String"]["output"];
  gender?: Maybe<Gender>;
  id: Scalars["ID"]["output"];
  onboardingState?: Maybe<OnboardingState>;
  onboardingStep: OnboardingStep;
};

export type OnboardingState = {
  __typename?: "OnboardingState";
  certificateLearner?: Maybe<Scalars["Boolean"]["output"]>;
  currentLevel?: Maybe<CefrLevel>;
  learningPurposeIds: Array<Scalars["Int"]["output"]>;
  targetCertificateType?: Maybe<Scalars["String"]["output"]>;
  targetDate?: Maybe<Scalars["Date"]["output"]>;
  targetScore?: Maybe<Scalars["Float"]["output"]>;
  targetSkills: Array<LearningSkill>;
};

export enum OnboardingStep {
  CERTIFICATE_TARGET = "CERTIFICATE_TARGET",
  COMPLETED = "COMPLETED",
  CURRENT_LEVEL = "CURRENT_LEVEL",
  LEARNING_GOAL = "LEARNING_GOAL",
  LEARNING_PURPOSES = "LEARNING_PURPOSES",
  TARGET_SKILLS = "TARGET_SKILLS",
}

export type Query = {
  __typename?: "Query";
  health: Scalars["String"]["output"];
  me: Me;
};
