export const roadmapTypeDefs = /* GraphQL */ `
  enum RoadmapStatus {
    "Waiting for the first plan from the AI."
    GENERATING
    ACTIVE
    "The first plan could not be made; createRoadmap asks again."
    FAILED
    COMPLETED
    "Replaced by a plan for a different goal."
    SUPERSEDED
    "The learner turned the roadmap off."
    ABANDONED
  }

  enum RoadmapGoalType {
    CERTIFICATE
    LEVEL
  }

  enum RoadmapStageStatus {
    LOCKED
    CURRENT
    PASSED
    "Taken out by an adjustment. Never returned in a roadmap's stages."
    REPLACED
  }

  enum RoadmapContentKind {
    FLASHCARD_SET
    DICTATION_LESSON
    QUIZ
    SPEAKING_PROMPT
    ASSESSMENT_TASK
  }

  enum MilestoneKind {
    "Sit examId and reach requiredScore on the certificate scale."
    CERTIFICATE_MOCK
    "Take a level check and reach requiredLevel."
    LEVEL_CHECK
  }

  enum MilestoneStatus {
    PENDING
    PASSED
    "The last attempt fell short; it can be taken again."
    FAILED
  }

  enum RoadmapSchedule {
    ON_TRACK
    "The current stage ran past its planned end."
    BEHIND
  }

  enum AdjustmentReason {
    MILESTONE_PASSED
    MILESTONE_FAILED
    BEHIND_SCHEDULE
    AHEAD_OF_SCHEDULE
    GOAL_CHANGED
    LEVEL_REASSESSED
  }

  enum LevelCheckPurpose {
    "The starting level of a learner without a certificate goal."
    ONBOARDING
    "The test closing a stage of a level roadmap."
    MILESTONE
  }

  enum LevelCheckStatus {
    "The paper is not scored yet."
    IN_PROGRESS
    "The paper is scored; the spoken answer is not graded yet, or not given."
    AWAITING_SPEAKING
    COMPLETED
  }

  type RoadmapItem {
    id: ID!
    kind: RoadmapContentKind!
    """
    The set, lesson, quiz, prompt or task to open; the link is built from this
    and the kind (and skill, for a writing or speaking task).
    """
    contentId: ID!
    title: String!
    skill: String
    required: Boolean!
    targetPercent: Int!
    plannedWeek: Int!
    estimatedMinutes: Int!
    "Derived from the learner's activity on every read."
    percentDone: Int!
    done: Boolean!
  }

  type RoadmapMilestone {
    id: ID!
    kind: MilestoneKind!
    examId: ID
    requiredScore: Float
    requiredLevel: CefrLevel
    status: MilestoneStatus!
    resultScore: Float
    resultLevel: CefrLevel
    attemptCount: Int!
    achievedAt: DateTime
    "Every required item of the stage is done."
    ready: Boolean!
  }

  type RoadmapStage {
    id: ID!
    orderNo: Int!
    title: String!
    summary: String!
    fromLevel: CefrLevel!
    toLevel: CefrLevel!
    focusSkills: [String!]!
    plannedStart: Date!
    plannedEnd: Date!
    status: RoadmapStageStatus!
    "Mean progress across the stage's required items."
    percentDone: Int!
    items: [RoadmapItem!]!
    milestone: RoadmapMilestone
  }

  type RoadmapAdjustment {
    reason: AdjustmentReason!
    createdAt: DateTime!
  }

  type Roadmap {
    id: ID!
    status: RoadmapStatus!
    goalType: RoadmapGoalType!
    targetCertificate: String
    targetScore: Float
    targetLevel: CefrLevel
    targetDate: Date
    startLevel: CefrLevel!
    startScore: Float
    dailyMinutes: Int
    "An adjustment is being worked out; the stages shown stay in force meanwhile."
    adjusting: Boolean!
    pendingReason: AdjustmentReason
    failureCode: String
    schedule: RoadmapSchedule!
    createdAt: DateTime!
    completedAt: DateTime
    stages: [RoadmapStage!]!
    adjustments: [RoadmapAdjustment!]!
  }

  type LevelCheck {
    id: ID!
    purpose: LevelCheckPurpose!
    status: LevelCheckStatus!
    milestoneId: ID
    "The paper to sit (vocabulary/grammar and listening), through the exam screens."
    examId: ID!
    "The spoken task to answer; null when none is published."
    speakingTaskId: ID
    examAttemptId: ID
    speakingAttemptId: ID
    speakingSkipped: Boolean!
    "The spoken answer could not be graded; answer again or skip it."
    speakingFailed: Boolean!
    vocabLevel: CefrLevel
    listeningLevel: CefrLevel
    speakingLevel: CefrLevel
    resultLevel: CefrLevel
    "The band from the written parts alone while the spoken part is outstanding."
    provisionalLevel: CefrLevel
    createdAt: DateTime!
    completedAt: DateTime
  }

  type LevelCheckWeightChange {
    id: ID!
    purposeCode: String!
    vocabulary: Int!
    listening: Int!
    speaking: Int!
    priority: Int!
    effectiveFrom: DateTime!
    "Who set it; null for the seeded defaults."
    changedBy: String
  }

  type LevelCheckWeightPurpose {
    "DEFAULT, or a learning purpose code."
    purposeCode: String!
    "The purpose's name as learners see it; null for DEFAULT."
    displayName: String
    "The purpose's own weights in force now; null when it falls back to DEFAULT."
    inForce: LevelCheckWeightChange
  }

  type LevelCheckWeights {
    purposes: [LevelCheckWeightPurpose!]!
    "The latest changes, newest first."
    history: [LevelCheckWeightChange!]!
  }

  input LevelCheckWeightInput {
    purposeCode: String!
    vocabulary: Int!
    listening: Int!
    speaking: Int!
    """
    Among a learner's purposes, the highest priority decides. 0-100.
    """
    priority: Int!
  }

  extend type Query {
    """
    How the level check's parts are weighted, by learning purpose.
    Administrator only (FORBIDDEN otherwise).
    """
    levelCheckWeights: LevelCheckWeights!
    """
    The plan in play, else the newest one (failed or finished), else null.
    Reading it can start an automatic replan when the learner is a week behind.
    """
    roadmap: Roadmap
    "The learner's most recent level check, or null."
    latestLevelCheck: LevelCheck
    "Reading a check picks up any grade that arrived since the last look."
    levelCheck(id: ID!): LevelCheck!
  }

  extend type Mutation {
    """
    New weights for one purpose, in force from now; checks already completed
    keep theirs. Refuses with LEVEL_CHECK_WEIGHTS_INVALID unless the three add
    up to 100 with something on the written side, and LEVEL_CHECK_PURPOSE_UNKNOWN
    for a purpose that does not exist. Administrator only.
    """
    setLevelCheckWeight(input: LevelCheckWeightInput!): LevelCheckWeights!
    """
    A plan for the learner's current goal. The same goal returns the same plan;
    a changed score, level or date adjusts it; a different goal replaces it.
    Refuses with ROADMAP_LEVEL_UNKNOWN or ROADMAP_GOAL_INCOMPLETE before
    onboarding has a level and a goal, ROADMAP_NO_CONTENT when nothing is
    published to plan with, and ROADMAP_DAILY_LIMIT after five a day.
    """
    createRoadmap: Roadmap!
    abandonRoadmap: Boolean!
    "A finished sitting of the current stage's mock paper."
    recordMilestoneSitting(milestoneId: ID!, examAttemptId: ID!): Roadmap!
    "Starts a check, or returns the one already open for the same purpose."
    startLevelCheck(purpose: LevelCheckPurpose!, milestoneId: ID): LevelCheck!
    attachLevelCheckExamAttempt(id: ID!, attemptId: ID!): LevelCheck!
    attachLevelCheckSpeakingAttempt(id: ID!, attemptId: ID!): LevelCheck!
    skipLevelCheckSpeaking(id: ID!): LevelCheck!
  }
`;
