export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: unknown; output: unknown; }
};

export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
  Other = 'OTHER'
}

export enum LearningSkill {
  Grammar = 'GRAMMAR',
  Listening = 'LISTENING',
  Pronunciation = 'PRONUNCIATION',
  Reading = 'READING',
  Speaking = 'SPEAKING',
  Vocabulary = 'VOCABULARY',
  Writing = 'WRITING'
}

export type Me = {
  __typename?: 'Me';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['Date']['output']>;
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  gender?: Maybe<Gender>;
  id: Scalars['ID']['output'];
  onboardingState?: Maybe<OnboardingState>;
  onboardingStep: OnboardingStep;
};

export type OnboardingState = {
  __typename?: 'OnboardingState';
  certificateLearner?: Maybe<Scalars['Boolean']['output']>;
  currentLevel?: Maybe<CefrLevel>;
  learningPurposeIds: Array<Scalars['Int']['output']>;
  targetCertificateType?: Maybe<Scalars['String']['output']>;
  targetDate?: Maybe<Scalars['Date']['output']>;
  targetScore?: Maybe<Scalars['Float']['output']>;
  targetSkills: Array<LearningSkill>;
};

export enum OnboardingStep {
  CertificateTarget = 'CERTIFICATE_TARGET',
  Completed = 'COMPLETED',
  CurrentLevel = 'CURRENT_LEVEL',
  LearningGoal = 'LEARNING_GOAL',
  LearningPurposes = 'LEARNING_PURPOSES',
  TargetSkills = 'TARGET_SKILLS'
}

export type Query = {
  __typename?: 'Query';
  health: Scalars['String']['output'];
  me: Me;
};
