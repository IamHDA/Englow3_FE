export const onboardingTypeDefs = `#graphql
  enum CefrLevel {
    A1
    A2
    B1
    B2
    C1
    C2
  }

  """
  The certificate a learner aims at. Deliberately not the exam module's
  CertificateType: that one describes a paper, this one describes a learner's
  goal, and the backend keeps user.entity.CertificateType apart from
  exam.entity.CertificateType for the same reason.
  """
  enum TargetCertificate {
    IELTS
    TOEIC
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

  input LearningGoalInput {
    certificateType: TargetCertificate!
    """Only a certificate learner may send this - the backend refuses it otherwise."""
    targetScore: Float
    targetDate: Date
  }

  extend type Me {
    onboardingState: OnboardingState
  }

  extend type Query {
    learningPurposes: [LearningPurpose!]!
  }

  extend type Mutation {
    """
    Records the purposes and advances the step. Which step comes next is the
    backend's decision: a learner who picked the certificate purpose goes to
    CERTIFICATE_TARGET, everyone else skips straight to CURRENT_LEVEL. Read the
    new step from Me.onboardingStep rather than assuming either branch.
    """
    selectLearningPurposes(purposeIds: [Int!]!): OnboardingState!

    """
    Only valid for a certificate learner - the backend answers
    extensions.backendCode: CERTIFICATE_TARGET_NOT_APPLICABLE for anyone else.
    """
    setCertificateTarget(certificateType: TargetCertificate!): OnboardingState!

    """
    Non-null on purpose: the backend accepts a null level only to route the
    learner into a placement test or levelling quiz, and neither exists yet, so
    it answers PLACEMENT_NOT_AVAILABLE / QUIZ_NOT_AVAILABLE. Offering the field
    as nullable here would advertise a path that always fails.
    """
    setCurrentLevel(level: CefrLevel!): OnboardingState!

    """Refuses with ONBOARDING_LEVEL_REQUIRED until the level step is done."""
    setLearningGoal(input: LearningGoalInput!): OnboardingState!

    """
    An empty list means "I don't know yet" and is allowed. This does not
    advance the step - the backend leaves the learner on TARGET_SKILLS until
    completeOnboarding is called.
    """
    selectTargetSkills(skills: [LearningSkill!]!): OnboardingState!

    """
    Final step. Refuses with ONBOARDING_PURPOSE_REQUIRED,
    ONBOARDING_LEVEL_REQUIRED or ONBOARDING_CERTIFICATE_TARGET_REQUIRED when an
    earlier step is missing.
    """
    completeOnboarding: OnboardingState!
  }
`;
