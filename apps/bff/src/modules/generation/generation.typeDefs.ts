export const generationTypeDefs = /* GraphQL */ `
  enum GenerationKind {
    "A Listening + Reading paper, five Writing and Speaking tasks, a draft full test."
    IELTS_FULL_TEST
  }

  enum GenerationStatus {
    QUEUED
    RUNNING
    "The drafts are waiting for review."
    COMPLETED
    "Stopped at a step; failureCode and failureMessage say why."
    FAILED
  }

  """
  One press of "generate". The backend runs it step by step - plan, Listening
  parts, Reading passages, Writing, Speaking, assemble, chart, recordings,
  finish - and a screen follows it by asking again.
  """
  type GenerationRequest {
    id: ID!
    kind: GenerationKind!
    status: GenerationStatus!
    "The step running, or where the request stopped."
    step: String
    stepIndex: Int!
    stepsTotal: Int!
    "Attempts already spent on the current step (at most 3)."
    attempt: Int!
    brief: String
    requestedByName: String
    "The set's title once the plan is written."
    title: String
    examId: ID
    taskIds: [ID!]!
    fullTestId: ID
    failureCode: String
    failureMessage: String
    "What the model got wrong on its last attempt at the current step."
    lastProblems: [String!]!
    createdAt: DateTime!
    completedAt: DateTime
  }

  type GenerationRequestPage {
    items: [GenerationRequest!]!
    page: Int!
    totalPages: Int!
    totalItems: Int!
  }

  "Today's requests for the signed-in user; a failed request does not count."
  type GenerationAllowance {
    limit: Int!
    used: Int!
    remaining: Int!
    inProgress: Boolean!
  }

  extend type Query {
    generationRequests(page: Int = 0, size: Int = 20): GenerationRequestPage!
    generationRequest(id: ID!): GenerationRequest!
    generationAllowance: GenerationAllowance!
  }

  extend type Mutation {
    """
    Starts a request for the signed-in staff member or administrator. Refused
    with extensions.backendCode GENERATION_DAILY_LIMIT or
    GENERATION_IN_PROGRESS.
    """
    requestGeneration(kind: GenerationKind!, brief: String): GenerationRequest!
  }
`;
