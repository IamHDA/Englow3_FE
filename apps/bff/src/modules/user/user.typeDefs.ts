export const userTypeDefs = /* GraphQL */ `
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

  type UserTourStatus {
    completed: Boolean!
  }

  """
  A profile picture to choose from. There is no upload: a profile wears one of
  these, served by the web app.
  """
  type AvatarPreset {
    id: ID!
    url: String!
  }

  extend type Query {
    me: Me!
    myTourStatus: UserTourStatus!
    avatarPresets: [AvatarPreset!]!
  }

  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): Me!
    completeMyTour: UserTourStatus!
    """
    Wears one of the preset pictures. Refused with extensions.backendCode
    AVATAR_PRESET_UNKNOWN for an id that names none.
    """
    chooseAvatar(preset: ID!): Me!
  }
`;
