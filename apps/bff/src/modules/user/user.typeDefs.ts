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

  """
  What the account may do. For drawing the interface only - every gate is
  enforced on the backend from the verified token, never from this field.
  """
  enum Role {
    LEARNER
    STAFF
    ADMIN
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
    role: Role!
  }

  input UpdateProfileInput {
    fullName: String!
    displayName: String!
    gender: Gender
    birthDate: Date
  }

  extend type Query {
    me: Me!
  }

  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): Me!
  }
`;
