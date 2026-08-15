export const userTypeDefs = `#graphql
  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum OnboardingStep {
    LEARNING_PURPOSES
    CERTIFICATE_TARGET
    CURRENT_LEVEL
    LEARNING_GOAL
    TARGET_SKILLS
    COMPLETED
  }

  type Me {
    id: ID!
    email: String!
    fullName: String!
    displayName: String!
    gender: Gender
    birthDate: Date
    avatarUrl: String
    bannerUrl: String
    onboardingStep: OnboardingStep!
  }

  extend type Query {
    me: Me!
  }
`;
