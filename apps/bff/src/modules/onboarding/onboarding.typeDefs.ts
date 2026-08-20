export const onboardingTypeDefs = `#graphql
  enum CefrLevel {
    A1
    A2
    B1
    B2
    C1
    C2
  }

  enum LearningSkill {
    LISTENING
    READING
    WRITING
    SPEAKING
    GRAMMAR
    VOCABULARY
    PRONUNCIATION
  }

  type OnboardingState {
    learningPurposeIds: [Int!]!
    certificateLearner: Boolean
    targetCertificateType: String
    currentLevel: CefrLevel
    targetScore: Float
    targetDate: Date
    targetSkills: [LearningSkill!]!
  }

  type LearningPurpose {
    id: Int!
    purposeCode: String!
    displayName: String!
  }

  extend type Me {
    onboardingState: OnboardingState
  }

  extend type Query {
    learningPurposes: [LearningPurpose!]!
  }
`;
