export const speakingTypeDefs = `#graphql
  """
  Where one recording stands. There is no RUNNING: whether a worker currently
  has the job in hand is the queue's business, and QUEUED is all a learner
  watching a spinner needs to know.
  """
  enum SpeakingAttemptStatus {
    AWAITING_UPLOAD
    QUEUED
    ASSESSED
    FAILED
  }

  type SpeakingPrompt {
    id: ID!
    slug: String!
    title: String!
    category: String!
    targetLevel: String
    """What the learner is asked to say. The accuracy score is accuracy against this."""
    referenceText: String!
    ipaTranscript: String
    translationVi: String
    """The sound being drilled, e.g. "/iː/ vs /ɪ/"."""
    phonemeTarget: String
    tips: [String!]!
    """Per learner. Null until they have finished one."""
    bestScorePercent: Float
  }

  type SpeakingPromptPage {
    items: [SpeakingPrompt!]!
    page: Int!
    size: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type SpeakingPhonemeScore {
    phoneme: String!
    accuracy: Float
  }

  type SpeakingWord {
    orderNo: Int!
    word: String!
    accuracyPercent: Float
    """The provider's own label: Mispronunciation, Omission, Insertion, None."""
    errorType: String
    offsetMs: Int
    durationMs: Int
    phonemes: [SpeakingPhonemeScore!]!
  }

  """
  One recording and its score.

  Every score is nullable and stays that way. The provider omits what it did
  not measure - prosody unless asked for, accuracy on a recording of silence -
  so a missing measurement is shown as missing. A zero would tell a learner
  they scored nothing when nothing was measured.
  """
  type SpeakingAttempt {
    id: ID!
    speakingPromptId: ID!
    promptTitle: String!
    referenceText: String!
    status: SpeakingAttemptStatus!
    """Pre-signed and short-lived."""
    audioUrl: String!
    """What the provider heard. Null until assessed."""
    recognizedText: String
    accuracyPercent: Float
    fluencyPercent: Float
    completenessPercent: Float
    prosodyPercent: Float
    pronunciationPercent: Float
    """Why no score will arrive, when none will."""
    errorCode: String
    createdAt: DateTime!
    assessedAt: DateTime
    """Empty while the assessment is still queued."""
    words: [SpeakingWord!]!
  }

  """Where to put a recording, and for how long that offer stands."""
  type SpeakingUploadTicket {
    attemptId: ID!
    """
    A presigned PUT straight to object storage. The browser uploads there, not
    through this BFF: a minute of audio through a request thread costs a thread
    for a minute and lands in the same bucket either way.
    """
    uploadUrl: String!
    contentType: String!
    """Told to the client so it can say "start again" rather than failing on an expired URL."""
    expiresInSeconds: Int!
  }

  extend type Query {
    speakingPrompts(
      category: String
      title: String
      page: Int = 0
      size: Int = 20
    ): SpeakingPromptPage!

    speakingPrompt(id: ID!): SpeakingPrompt!

    """What the screen polls while it waits for a score."""
    speakingAttempt(id: ID!): SpeakingAttempt!

    """This learner's own attempts at one prompt, newest first. No word breakdown."""
    speakingAttempts(promptId: ID!): [SpeakingAttempt!]!
  }

  extend type Mutation {
    """
    Opens an attempt and returns somewhere to PUT the recording. The format is
    checked now rather than at assessment time, so an unusable one is refused
    before the learner records anything.
    """
    startSpeakingAttempt(promptId: ID!, contentType: String!): SpeakingUploadTicket!

    """
    The upload is done; queue the assessment. Refused with
    extensions.backendCode SPEAKING_RECORDING_MISSING if the recording is not
    actually in storage.
    """
    submitSpeakingAttempt(attemptId: ID!): SpeakingAttempt!
  }
`;
