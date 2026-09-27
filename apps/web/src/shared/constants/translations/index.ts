export type Language = "vi" | "en";

export interface NavTranslations {
  study: string;
  exams: string;
  aiTutor: string;
  pronunciation: string;
  pronunciationDesc: string;
  flashcards: string;
  flashcardsDesc: string;
  dictation: string;
  dictationDesc: string;
  dailyPath: string;
  dailyPathDesc: string;
  profile: string;
  settings: string;
  logout: string;
  login: string;
  home: string;
  account: string;
  completeOnboarding: string;
}

export interface CommonTranslations {
  save: string;
  cancel: string;
  continue: string;
  back: string;
  start: string;
  finish: string;
  submit: string;
  hint: string;
  search: string;
  filter: string;
  all: string;
  loading: string;
  error: string;
  retry: string;
  success: string;
  viewAll: string;
  level: string;
  score: string;
  accuracy: string;
  timeRemaining: string;
  completed: string;
  inProgress: string;
  locked: string;
  status: string;
  copied: string;
  /** "{thing}" is replaced with the caller's item name, e.g. "deck", "lesson". */
  notFoundTitle: string;
  /** "{Thing}" is the capitalized item name - only the vi wording actually uses it. */
  notFoundDescription: string;
  loadErrorTitle: string;
  loadErrorDescription: string;
  languageSwitcherTooltip: string;
  languageSwitcherMenuLabel: string;
  reset: string;
}

export interface AccountTranslations {
  title: string;
  subtitle: string;
  personalInfoTab: string;
  learningTab: string;
  securityTab: string;
  fullName: string;
  displayName: string;
  gender: string;
  male: string;
  female: string;
  otherGender: string;
  birthDate: string;
  saveChanges: string;
  saving: string;
  updateSuccessTitle: string;
  updateSuccessMessage: string;
  updateErrorTitle: string;
  memberSince: string;
  targetGoal: string;
  targetDate: string;
  currentBand: string;
  targetBand: string;
  streakDays: string;
  totalHours: string;
  completedLessons: string;
  email: string;
  password: string;
  changePassword: string;
  twoFactor: string;
  twoFactorDesc: string;
  activeSessions: string;
  logoutAll: string;
  accountPasswordTitle: string;
  accountPasswordDesc: string;
  sendResetEmail: string;
  resetLinkValidNotice: string;
  sendingEmail: string;
  sendingEmailDesc: string;
  resetEmailSentTitle: string;
  resetEmailSentDesc: string;
  resetEmailErrorTitle: string;
  connectionErrorTitle: string;
  connectionErrorDesc: string;
  activeSessionsTitle: string;
  activeSessionsDesc: string;
  currentBrowser: string;
  activeNow: string;
  supabaseAuthNotice: string;
  secureSession: string;
  onboardingReady: string;
  onboardingStepLearningPurposes: string;
  onboardingStepCertificateTarget: string;
  onboardingStepLearningGoal: string;
  studentId: string;
  clickToCopyId: string;
  learningTargetsCardTitle: string;
  targetScoreLabel: string;
  /** Also the onboarding CURRENT_LEVEL step's badge label - same text either way. */
  currentLevelLabel: string;
  /** Also the onboarding TARGET_SKILLS step's badge label - same text either way. */
  targetSkillsLabel: string;
  certificateNotSelected: string;
  levelNotAssessed: string;
  updateLearningGoalsButton: string;
  skillListening: string;
  skillReading: string;
  skillWriting: string;
  skillSpeaking: string;
  skillGrammar: string;
  skillVocabulary: string;
  skillPronunciation: string;
  notConfigured: string;
  targetScoreEmpty: string;
  learningRoadmapTitle: string;
  targetCertificateLabel: string;
  goalPrefix: string;
  cefrEvaluationBadge: string;
  targetDeadlineLabel: string;
  flexibleDeadline: string;
  adaptiveScheduleBadge: string;
  prioritySkillsTitle: string;
  noSkillsSelectedHint: string;
  profileLoadErrorTitle: string;
  profileLoadErrorDescription: string;
  notSignedInTitle: string;
  notSignedInDescription: string;
  saveErrorFallback: string;
  fullNamePlaceholder: string;
  displayNamePlaceholder: string;
  selectGenderPlaceholder: string;
  emailFieldDescription: string;
}

export interface FlashcardTranslations {
  title: string;
  subtitle: string;
  srsBadge: string;
  decksTab: string;
  statsTab: string;
  dueToday: string;
  streak: string;
  retentionRate: string;
  startReview: string;
  searchPlaceholder: string;
  topicAll: string;
  sortBy: string;
  sortDue: string;
  sortProgress: string;
  sortCards: string;
  flipCard: string;
  flipBack: string;
  showMeaning: string;
  phonetic: string;
  example: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  mastered: string;
  learning: string;
  newCards: string;
  totalCards: string;
  deckProgress: string;
  difficultWords: string;
  studySessionComplete: string;
  studySessionDesc: string;
  returnToDecks: string;
  frontVocab: string;
  backMeaning: string;
  needsAttention: string;
  memoryStages: string;
  newCardsBadge: string;
  reviewHintSpace: string;
  flipPrompt: string;
  assessRetentionLabel: string;
  ratingAgainHint: string;
  ratingHardHint: string;
  ratingGoodHint: string;
  ratingEasyHint: string;
  needsReviewBadge: string;
  listenNativeAudioTooltip: string;
  listenAudioAria: string;
  pronounceWordAria: string;
  flipHintFooter: string;
  listenAgainAria: string;
  vietnameseMeaningLabel: string;
  englishDefinitionLabel: string;
  contextExampleLabel: string;
  memoryMnemonicLabel: string;
  rateRetentionFooter: string;
  cardsReviewedPerDay: string;
  noReviewsInPeriod: string;
  priorityWordsBadge: string;
  deckColumn: string;
  missesColumnShort: string;
  lastReviewColumn: string;
  audioColumn: string;
  noForgottenWords: string;
  missCountBadge: string;
  allTopicsChip: string;
  dailyConversationChip: string;
  travelChip: string;
  gridViewTooltip: string;
  gridViewAria: string;
  listViewTooltip: string;
  listViewAria: string;
  streakDaysBanner: string;
  cardsDueTodayMessage: string;
  nothingDueTodayMessage: string;
  startReviewCount: string;
  learnNewCardsButton: string;
  noSetsToStudyButton: string;
  dueTodayLabel: string;
  cardsUnit: string;
  retentionRateLabel: string;
  notStudiedYet: string;
  studiedToday: string;
  studiedYesterday: string;
  daysAgoSuffix: string;
  wordsCountSuffix: string;
  dueCardsBadge: string;
  reviewButton: string;
  studyButton: string;
  noSetsPublished: string;
  noSetsMatchFilters: string;
  couldNotLoadSets: string;
  period7DaysShort: string;
  period30DaysShort: string;
  period3MonthsShort: string;
  periodAllTimeShort: string;
  backToDecksButton: string;
  studyDeckNowButton: string;
  cardsDueTodayBadge: string;
  completedForTodayBadge: string;
  totalCardsLabel: string;
  lastStudiedLabel: string;
  masteredColonLabel: string;
  deckWordListTitle: string;
  clickSpeakerHint: string;
  ipaColumn: string;
  partOfSpeechColumn: string;
  definitionColumn: string;
  englishMeaningColumn: string;
  statusColumn: string;
  reviewStatusBadge: string;
  learningStatusBadge: string;
  newStatusBadge: string;
  listenWordAria: string;
  exitSessionButton: string;
  cardPositionLabel: string;
  nothingToReviewTitle: string;
  nothingToReviewDescription: string;
  backToDeckButton: string;
  setNameColumn: string;
  cardCountColumn: string;
  dueTodayColumn: string;
  lastStudiedColumn: string;
  viewButton: string;
}

export interface PronunciationTranslations {
  title: string;
  subtitle: string;
  ipaBadge: string;
  micReady: string;
  startRecording: string;
  stopRecording: string;
  listening: string;
  processingAI: string;
  nativeAudio: string;
  yourAudio: string;
  waveformTitle: string;
  phonemeBreakdown: string;
  intonationScore: string;
  fluencyScore: string;
  overallScore: string;
  excellent: string;
  goodEffort: string;
  needPractice: string;
  tryAgain: string;
  nextExercise: string;
  vowels: string;
  consonants: string;
  diphthongs: string;
  lessonsList: string;
}

export interface DailyPathTranslations {
  title: string;
  subtitle: string;
  roadmapTab: string;
  quizCatalogueTab: string;
  streakTitle: string;
  streakSubtitle: string;
  dailyQuestsTitle: string;
  dailyQuestsSubtitle: string;
  claimReward: string;
  claimed: string;
  startNode: string;
  reviewNode: string;
  lockedNode: string;
  nextMilestone: string;
  allQuizzes: string;
  quizDifficulty: string;
}

export interface QuizTranslations {
  questionNumber: string;
  timer: string;
  submitExam: string;
  nextQuestion: string;
  prevQuestion: string;
  chooseOption: string;
  fillPlaceholder: string;
  rewritePlaceholder: string;
  reorderInstruction: string;
  matchingInstruction: string;
  explanation: string;
  summaryTitle: string;
  summarySubtitle: string;
  correctAnswers: string;
  xpEarned: string;
  retakeQuiz: string;
  backToRoadmap: string;
}

export interface DictationTranslations {
  title: string;
  subtitle: string;
  listeningBadge: string;
  lessonsTab: string;
  statsTab: string;
  playSpeed: string;
  replaySentence: string;
  inputPlaceholder: string;
  checkAnswer: string;
  nextSentence: string;
  charHint: string;
  originalAudio: string;
  comparisonTitle: string;
  yourInput: string;
  correctTranscript: string;
  spellingErrors: string;
  accuracyScore: string;
  wpmSpeed: string;
  practiceAgain: string;
  gridView: string;
  listView: string;
  wordDiffResult: string;
  mistakesTitle: string;
  difficultSentencesTitle: string;
  historyTitle: string;
  sessionMetricsTitle: string;
  replaysCount: string;
  hintsUsedCount: string;
  accuracyBreakdown: string;
  accuracyOverTime: string;
  practiceActivity: string;
  sessionCompletedBadge: string;
  sessionCompletedTitle: string;
  overallAccuracy: string;
  wordsCorrect: string;
  sentencesCompleted: string;
  studyDuration: string;
  reviewMistakes: string;
  replaysBadge: string;
  back5Aria: string;
  pauseAria: string;
  playAudioAria: string;
  forward5Aria: string;
  speedLabel: string;
  chartsEmptyState: string;
  sentencesPerDayLabel: string;
  sentencesPracticedSuffix: string;
  perfectScoreTitle: string;
  wordsNeedCorrection: string;
  accuracyDetail: string;
  legendCorrect: string;
  legendIncorrect: string;
  legendMissing: string;
  fullSentenceLabel: string;
  tokensToFixLabel: string;
  mistakesOnlySegment: string;
  fullSentenceSegment: string;
  noErrorsDetected: string;
  replayAudioButton: string;
  finishAndViewResults: string;
  filterByTopicAria: string;
  filterByLevelAria: string;
  filterByStatusAria: string;
  sortLessonsAria: string;
  noHardSentences: string;
  avgAccuracyPrefix: string;
  attemptsSuffix: string;
  practiceButton: string;
  hintWordCountLabel: string;
  wordsUnit: string;
  hintFirstLettersLabel: string;
  hintRevealWordLabel: string;
  hintTranslationLabel: string;
  hintPartialTranscriptLabel: string;
  collapseHints: string;
  needHint: string;
  hintsUsedBadge: string;
  hintsCounterNote: string;
  unlockHint: string;
  dateColumn: string;
  lessonColumn: string;
  sentencesColumn: string;
  durationColumn: string;
  hintsColumn: string;
  actionColumn: string;
  noSessionsYet: string;
  detailsButton: string;
  wordsTypedCount: string;
  toCheckHint: string;
  skipButton: string;
  minutesUnit: string;
  notPractisedYet: string;
  practisedToday: string;
  practisedYesterday: string;
  daysAgoSuffix: string;
  sentenceCountSuffix: string;
  practiceAgainShort: string;
  continueButton: string;
  topicColumn: string;
  difficultyColumn: string;
  progressColumn: string;
  wordColumn: string;
  missesColumn: string;
  correctColumn: string;
  noMissedWords: string;
  exampleLabel: string;
  timesUnit: string;
  allMistakesClearedTitle: string;
  allMistakesClearedDescription: string;
  backToLessonsButton: string;
  mistakePracticeBadge: string;
  queueCountLabel: string;
  queuePositionLabel: string;
  bestAttemptSummary: string;
  clearMistakeHint: string;
  lastTypedPrefix: string;
  correctAnswerReveal: string;
  checkFailedMessage: string;
  clearedFeedback: string;
  notQuiteFeedback: string;
  continueToNextButton: string;
  tryNextButton: string;
  reviewMistakesCount: string;
  hintsUnit: string;
  perfectSentencesLabel: string;
  sentencesWithMistakesLabel: string;
  sentencesToReviewTitle: string;
  startReviewingMistakes: string;
  zeroMistakesMessage: string;
  yourInputShort: string;
  correctAnswerShort: string;
  backToLessonCatalog: string;
  completedLessonsLabel: string;
  lessonsUnit: string;
  averageAccuracyLabel: string;
  overallSentencesUnit: string;
  listeningHoursLabel: string;
  focusedPracticeUnit: string;
  sentencesPracticedLabel: string;
  sentencesCompletedUnit: string;
  statsPageTitle: string;
  period7Days: string;
  period30Days: string;
  period3Months: string;
  periodAllTime: string;
  noLessonsPublished: string;
  noLessonsMatchFilters: string;
  couldNotLoadLessons: string;
  checkConnectionReload: string;
  backToLibraryButton: string;
}

export interface HomeCopyItem {
  title: string;
  description: string;
}

export interface HomeTranslations {
  heroBadge: string;
  heroTitle: string;
  /** The half of the title set in the brand accent. */
  heroTitleAccent: string;
  heroQuote: string;
  heroDescription: string;
  heroCta: string;
  heroSecondaryCta: string;
  heroImageAlt: string;
  highlightsAria: string;
  /** What the product covers - facts about it, not usage figures. */
  highlights: { value: string; label: string }[];
  featuresEyebrow: string;
  featuresTitle: string;
  featuresSubtitle: string;
  /** In the order HomeFeatures pairs with icons. */
  features: HomeCopyItem[];
  stepsEyebrow: string;
  stepsTitle: string;
  steps: HomeCopyItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  footerTagline: string;
  footerProject: string;
}

export interface AuthTranslations {
  loginTitle: string;
  loginSubtitle: string;
  loginSocial: string;
  noAccountPrompt: string;
  registerAction: string;
  registerTitle: string;
  registerSubtitle: string;
  registerSocial: string;
  hasAccountPrompt: string;
  loginAction: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  loginSubmit: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  nicknameLabel: string;
  nicknameHint: string;
  nicknamePlaceholder: string;
  passwordRegisterHint: string;
  createPasswordPlaceholder: string;
  birthDateLabel: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  genderLabel: string;
  termsAgreementPre: string;
  termsOfService: string;
  andWord: string;
  privacyPolicy: string;
  termsAgreementPost: string;
  createAccountSubmit: string;
  closeAria: string;
}

export interface ExamTranslations {
  title: string;
  subtitle: string;
  allExams: string;
  ieltsTab: string;
  toeicTab: string;
  fullTest: string;
  miniTest: string;
  startExam: string;
  durationMinutes: string;
  totalQuestions: string;
  participants: string;
  flagQuestionTip: string;
  mockTestBadge: string;
  officialExamsUnit: string;
  autoGradingLabel: string;
  aiAnalysisLabel: string;
  searchPlaceholder: string;
  clearSearchAria: string;
  sortByLabel: string;
  sortNewest: string;
  sortLevelAsc: string;
  sortLevelDesc: string;
  sortScoreDesc: string;
  skillAll: string;
  diffAll: string;
  statusAll: string;
  clearFilters: string;
  clearAllFilters: string;
  tabAll: string;
  examsCountUnit: string;
  notStarted: string;
  inProgress: string;
  completed: string;
  generalSkill: string;
  mockTestFallback: string;
  questionsUnit: string;
  minutesUnit: string;
  bestScoreLabel: string;
  maxScoreLabel: string;
  pointsUnit: string;
  retakeAction: string;
  continueAction: string;
  startAction: string;
  emptyTitle: string;
  emptySearchDesc: string;
  emptyFilterDesc: string;
  backToLibrary: string;
  defaultDescription: string;
  examTimeLabel: string;
  questionQuantityLabel: string;
  questionsUnitFull: string;
  maxScoreScaleLabel: string;
  passScoreLabel: string;
  passScoreUnset: string;
  sectionsCountLabel: string;
  sectionsUnit: string;
  examStructureLabel: string;
  sectionPrefix: string;
  sectionIncludes: string;
  allocatedTimeLabel: string;
  rulesTitle: string;
  rule1: string;
  rule2: string;
  rule3: string;
  rule4: string;
  returnToLibrary: string;
  exitExam: string;
  progress: string;
  submitExamCTA: string;
  exitConfirm: string;
  listeningSection: string;
  audioStimulus: string;
  questionPrefix: string;
  flag: string;
  flagged: string;
  prevQuestion: string;
  nextQuestion: string;
  paletteTitle: string;
  paletteCompleted: string;
  legendAnswered: string;
  legendFlagged: string;
  legendUnanswered: string;
  questionAria: string;
  confirmModalTitle: string;
  unansweredWarning: string;
  allDoneNotice: string;
  submitExplanation: string;
  continueDoing: string;
  confirmSubmitCTA: string;
  resultTitlePrefix: string;
  finishedBadge: string;
  estimatedScore: string;
  accuracyRate: string;
  correctAnswersCount: string;
  outOfTotal: string;
  incorrectAnswersCount: string;
  reviewNeeded: string;
  timeSpentLabel: string;
  skippedCount: string;
  minutesText: string;
  secondsText: string;
  explanationsTitle: string;
  explanationsDesc: string;
  tabAllReview: string;
  tabCorrect: string;
  tabIncorrect: string;
  tabSkipped: string;
  correctBadge: string;
  yourChoiceBadge: string;
  detailedExplanation: string;
  retakeCTA: string;
  notFoundQuestion: string;
  failedLoadExam: string;
  failedLoadExamDesc: string;
  showingRange: string;
  loadListError: string;
}

export interface AppTranslations {
  nav: NavTranslations;
  common: CommonTranslations;
  account: AccountTranslations;
  flashcard: FlashcardTranslations;
  pronunciation: PronunciationTranslations;
  dailyPath: DailyPathTranslations;
  quiz: QuizTranslations;
  dictation: DictationTranslations;
  exam: ExamTranslations;
  home: HomeTranslations;
  auth: AuthTranslations;
}

export const translations: Record<Language, AppTranslations> = {
  vi: {
    nav: {
      study: "Học tập",
      exams: "Thi thử",
      aiTutor: "Gia sư AI",
      pronunciation: "Luyện phát âm",
      pronunciationDesc: "Chấm điểm phát âm AI theo thời gian thực",
      flashcards: "Thẻ ghi nhớ",
      flashcardsDesc: "Bộ thẻ 3D tối ưu theo khả năng ghi nhớ của bạn",
      dictation: "Nghe chính tả",
      dictationDesc: "Thử thách nghe và gõ lại từng câu",
      dailyPath: "Lộ trình hàng ngày",
      dailyPathDesc: "Bài học thích ứng dành riêng cho bạn",
      profile: "Hồ sơ cá nhân",
      settings: "Cài đặt tài khoản",
      logout: "Đăng xuất",
      login: "Đăng nhập",
      home: "Trang chủ",
      account: "Tài khoản",
      completeOnboarding: "Hoàn thiện thông tin",
    },
    common: {
      save: "Lưu thay đổi",
      cancel: "Hủy bỏ",
      continue: "Tiếp tục",
      back: "Quay lại",
      start: "Bắt đầu",
      finish: "Hoàn thành",
      submit: "Nộp bài",
      hint: "Gợi ý",
      search: "Tìm kiếm...",
      filter: "Bộ lọc",
      all: "Tất cả",
      loading: "Đang tải dữ liệu...",
      error: "Đã xảy ra lỗi",
      retry: "Thử lại",
      success: "Thao tác thành công",
      viewAll: "Xem tất cả",
      level: "Cấp độ",
      score: "Điểm số",
      accuracy: "Độ chính xác",
      timeRemaining: "Thời gian còn lại",
      completed: "Đã hoàn thành",
      inProgress: "Đang thực hiện",
      locked: "Chưa mở khóa",
      status: "Trạng thái",
      copied: "Đã chép!",
      notFoundTitle: "Không tìm thấy {thing}",
      notFoundDescription:
        "{Thing} không tồn tại hoặc đã bị gỡ. Hãy chọn lại từ thư viện.",
      loadErrorTitle: "Không tải được {thing}",
      loadErrorDescription: "Máy chủ chưa phản hồi. Thử lại sau ít phút.",
      languageSwitcherTooltip: "Đổi ngôn ngữ giao diện",
      languageSwitcherMenuLabel: "Ngôn ngữ giao diện",
      reset: "Đặt lại",
    },
    account: {
      title: "Hồ sơ cá nhân",
      subtitle:
        "Quản lý thông tin tài khoản, mục tiêu luyện thi và các thiết lập cá nhân trên Englow3",
      personalInfoTab: "Thông tin cá nhân",
      learningTab: "Lộ trình & Mục tiêu",
      securityTab: "Tài khoản & Bảo mật",
      fullName: "Họ và tên",
      displayName: "Tên hiển thị",
      gender: "Giới tính",
      male: "Nam",
      female: "Nữ",
      otherGender: "Khác",
      birthDate: "Ngày sinh",
      saveChanges: "Lưu thông tin",
      saving: "Đang lưu...",
      updateSuccessTitle: "Cập nhật thành công",
      updateSuccessMessage: "Thông tin hồ sơ của bạn đã được cập nhật.",
      updateErrorTitle: "Không thể lưu hồ sơ",
      memberSince: "Thành viên từ",
      targetGoal: "Mục tiêu hiện tại",
      targetDate: "Ngày thi dự kiến",
      currentBand: "Điểm hiện tại",
      targetBand: "Mục tiêu hướng tới",
      streakDays: "Chuỗi ngày liên tục",
      totalHours: "Tổng giờ học",
      completedLessons: "Bài học đã hoàn thành",
      email: "Địa chỉ Email",
      password: "Mật khẩu",
      changePassword: "Đổi mật khẩu",
      twoFactor: "Xác thực hai yếu tố (2FA)",
      twoFactorDesc: "Tăng cường bảo vệ tài khoản bằng mã bảo mật",
      activeSessions: "Phiên đăng nhập hiện hoạt",
      logoutAll: "Đăng xuất khỏi tất cả thiết bị",
      accountPasswordTitle: "Mật khẩu tài khoản",
      accountPasswordDesc:
        "Bảo vệ tài khoản của bạn bằng mật khẩu mạnh và an toàn",
      sendResetEmail: "Gửi email đổi mật khẩu",
      resetLinkValidNotice:
        "Để đảm bảo an toàn, liên kết đặt lại mật khẩu có hiệu lực trong vòng 24 giờ. Hãy kiểm tra cả hộp thư Spam/Rác nếu bạn không thấy email trong Hộp thư đến.",
      sendingEmail: "Đang gửi email",
      sendingEmailDesc: "Vui lòng chờ trong giây lát...",
      resetEmailSentTitle: "Đã gửi email thành công",
      resetEmailSentDesc:
        "Liên kết đặt lại mật khẩu đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.",
      resetEmailErrorTitle: "Không thể gửi email",
      connectionErrorTitle: "Lỗi kết nối",
      connectionErrorDesc: "Không thể kết nối tới dịch vụ xác thực.",
      activeSessionsTitle: "Phiên đăng nhập & Thiết bị",
      activeSessionsDesc:
        "Các phiên đăng nhập hiện đang hoạt động trên hệ thống",
      currentBrowser: "Trình duyệt Web hiện tại",
      activeNow: "Đang hoạt động",
      supabaseAuthNotice: "Đăng nhập an toàn qua hệ thống Englow3",
      secureSession: "Phiên bảo mật",
      onboardingReady: "Đã sẵn sàng học",
      onboardingStepLearningPurposes: "Mục tiêu học tập",
      onboardingStepCertificateTarget: "Chứng chỉ mục tiêu",
      onboardingStepLearningGoal: "Mục tiêu điểm số",
      studentId: "Mã học viên",
      clickToCopyId: "Nhấn để sao chép mã",
      learningTargetsCardTitle: "Mục tiêu học tập",
      targetScoreLabel: "Mục tiêu điểm",
      currentLevelLabel: "Trình độ hiện tại",
      targetSkillsLabel: "Kỹ năng trọng tâm",
      certificateNotSelected: "Chưa chọn",
      levelNotAssessed: "Chưa đánh giá",
      updateLearningGoalsButton: "Cập nhật mục tiêu học",
      skillListening: "Nghe",
      skillReading: "Đọc",
      skillWriting: "Viết",
      skillSpeaking: "Nói",
      skillGrammar: "Ngữ pháp",
      skillVocabulary: "Từ vựng",
      skillPronunciation: "Phát âm",
      notConfigured: "Chưa thiết lập",
      targetScoreEmpty: "Chưa có",
      learningRoadmapTitle: "Lộ trình & Mục tiêu học tập",
      targetCertificateLabel: "Chứng chỉ hướng tới",
      goalPrefix: "Mục tiêu",
      cefrEvaluationBadge: "Đánh giá năng lực",
      targetDeadlineLabel: "Thời hạn mục tiêu",
      flexibleDeadline: "Linh hoạt",
      adaptiveScheduleBadge: "Lộ trình thích ứng",
      prioritySkillsTitle: "Kỹ năng tập trung rèn luyện",
      noSkillsSelectedHint:
        'Chưa chọn kỹ năng cụ thể. Bấm "Cập nhật mục tiêu học" để chọn.',
      profileLoadErrorTitle: "Không thể tải hồ sơ",
      profileLoadErrorDescription:
        "Đã có lỗi xảy ra khi tải thông tin hồ sơ. Vui lòng kiểm tra lại kết nối mạng hoặc đăng nhập lại.",
      notSignedInTitle: "Chưa đăng nhập",
      notSignedInDescription:
        "Vui lòng đăng nhập để xem và chỉnh sửa thông tin hồ sơ cá nhân của bạn.",
      saveErrorFallback: "Đã có lỗi xảy ra khi lưu hồ sơ",
      fullNamePlaceholder: "Ví dụ: Nguyễn Văn A",
      displayNamePlaceholder: "Ví dụ: An Nguyen",
      selectGenderPlaceholder: "Chọn giới tính",
      emailFieldDescription:
        "Email dùng để đăng nhập và nhận thông báo, không thể thay đổi tại đây",
    },
    flashcard: {
      title: "Thẻ ghi nhớ 3D",
      subtitle:
        "Ghi nhớ từ vựng dài hạn thông qua phương pháp lặp lại ngắt quãng và tương tác lật thẻ trực quan.",
      srsBadge: "Thuật toán SRS",
      decksTab: "Bộ từ vựng",
      statsTab: "Thống kê học tập",
      dueToday: "Từ cần ôn hôm nay",
      streak: "Chuỗi học liên tiếp",
      retentionRate: "Tỷ lệ ghi nhớ",
      startReview: "Bắt đầu ôn tập",
      searchPlaceholder: "Tìm kiếm bộ từ vựng theo tên hoặc chủ đề...",
      topicAll: "Tất cả chủ đề",
      sortBy: "Sắp xếp theo",
      sortDue: "Cần ôn tập nhiều nhất",
      sortProgress: "Tiến độ học cao nhất",
      sortCards: "Số lượng thẻ nhiều nhất",
      flipCard: "Lật thẻ",
      flipBack: "Lật lại",
      showMeaning: "Xem nghĩa tiếng Việt",
      phonetic: "Phiên âm",
      example: "Ví dụ câu",
      again: "Lặp lại ngay",
      hard: "Khó nhớ",
      good: "Nhớ tốt",
      easy: "Rất dễ",
      mastered: "Đã thành thạo",
      learning: "Đang học",
      newCards: "Thẻ mới",
      totalCards: "Tổng số từ",
      deckProgress: "Tiến độ bộ thẻ",
      difficultWords: "Từ vựng hay nhầm lẫn",
      studySessionComplete: "Hoàn thành phiên ôn tập!",
      studySessionDesc:
        "Bạn đã hoàn thành các thẻ cần ôn hôm nay. Tiếp tục giữ vững phong độ nhé!",
      returnToDecks: "Quay lại danh sách bộ thẻ",
      frontVocab: "Từ vựng (Mặt trước)",
      backMeaning: "Ý nghĩa (Mặt sau)",
      needsAttention: "Từ vựng hay quên",
      memoryStages: "Trạng thái lưu trữ não bộ",
      newCardsBadge: "Từ mới tinh",
      reviewHintSpace: "Nhấn phím cách hoặc bấm vào thẻ để xem nghĩa và ví dụ",
      flipPrompt: "Lật thẻ xem đáp án",
      assessRetentionLabel: "ĐÁNH GIÁ MỨC ĐỘ GHI NHỚ (Phím tắt 1 - 4):",
      ratingAgainHint: "Chưa nhớ (< 1 ngày)",
      ratingHardHint: "Khó (2 ngày)",
      ratingGoodHint: "Nhớ tốt (4 ngày)",
      ratingEasyHint: "Rất dễ (7 ngày)",
      needsReviewBadge: "Cần ôn lại ({count} lần sai)",
      listenNativeAudioTooltip: "Nghe phát âm chuẩn",
      listenAudioAria: "Nghe phát âm",
      pronounceWordAria: "Phát âm từ",
      flipHintFooter: "Nhấn phím cách hoặc bấm vào thẻ để xem nghĩa & ví dụ",
      listenAgainAria: "Nghe lại",
      vietnameseMeaningLabel: "NGHĨA TIẾNG VIỆT:",
      englishDefinitionLabel: "ĐỊNH NGHĨA ANH - ANH:",
      contextExampleLabel: "VÍ DỤ NGỮ CẢNH:",
      memoryMnemonicLabel: "MẸO GHI NHỚ:",
      rateRetentionFooter:
        "Đánh giá mức độ ghi nhớ ở bên dưới để hệ thống lặp lại khoa học",
      cardsReviewedPerDay: "Số thẻ ôn tập theo ngày",
      noReviewsInPeriod: "Chưa có lượt ôn tập nào trong khoảng thời gian này.",
      priorityWordsBadge: "{count} từ cần ưu tiên",
      deckColumn: "Bộ từ",
      missesColumnShort: "Số lần chưa nhớ",
      lastReviewColumn: "Lần xem cuối",
      audioColumn: "Phát âm",
      noForgottenWords: "Chưa có từ nào bạn hay quên.",
      missCountBadge: "{count} lần",
      allTopicsChip: "Tất cả",
      dailyConversationChip: "Giao tiếp hàng ngày",
      travelChip: "Du lịch",
      gridViewTooltip: "Xem dạng lưới",
      gridViewAria: "Dạng lưới",
      listViewTooltip: "Xem dạng danh sách",
      listViewAria: "Dạng danh sách",
      streakDaysBanner: "Chuỗi {count} ngày liên tiếp",
      cardsDueTodayMessage: "Hôm nay bạn có {count} thẻ đến hạn cần ôn tập!",
      nothingDueTodayMessage: "Hôm nay chưa có thẻ nào đến hạn ôn.",
      startReviewCount: "Bắt đầu ôn ngay ({count} thẻ)",
      learnNewCardsButton: "Học thẻ mới",
      noSetsToStudyButton: "Chưa có bộ thẻ nào để học",
      dueTodayLabel: "Thẻ đến hạn hôm nay:",
      cardsUnit: "thẻ",
      retentionRateLabel: "Tỷ lệ nhớ:",
      notStudiedYet: "Chưa học",
      studiedToday: "Hôm nay",
      studiedYesterday: "Hôm qua",
      daysAgoSuffix: "ngày trước",
      wordsCountSuffix: "từ vựng",
      dueCardsBadge: "{count} thẻ cần ôn",
      reviewButton: "Ôn ngay",
      studyButton: "Học",
      noSetsPublished: "Chưa có bộ thẻ nào được phát hành. Quay lại sau nhé.",
      noSetsMatchFilters:
        "Không có bộ thẻ nào khớp bộ lọc. Thử đổi từ khoá hoặc chủ đề.",
      couldNotLoadSets: "Không tải được bộ thẻ",
      period7DaysShort: "7 ngày",
      period30DaysShort: "30 ngày",
      period3MonthsShort: "3 tháng",
      periodAllTimeShort: "Tất cả",
      backToDecksButton: "Quay lại danh sách bộ thẻ",
      studyDeckNowButton: "Học ngay bộ từ này",
      cardsDueTodayBadge: "{count} từ cần ôn tập hôm nay",
      completedForTodayBadge: "Đã hoàn thành mục tiêu hôm nay",
      totalCardsLabel: "Tổng số từ:",
      lastStudiedLabel: "Lần học gần nhất:",
      masteredColonLabel: "Đã thuộc:",
      deckWordListTitle: "Danh sách từ vựng trong bộ ({count} thẻ)",
      clickSpeakerHint: "Bấm vào biểu tượng loa để nghe phát âm chuẩn bản xứ",
      ipaColumn: "Phiên âm IPA",
      partOfSpeechColumn: "Từ loại",
      definitionColumn: "Nghĩa",
      englishMeaningColumn: "Định nghĩa tiếng Anh",
      statusColumn: "Trạng thái",
      reviewStatusBadge: "Ôn tập",
      learningStatusBadge: "Đang học",
      newStatusBadge: "Từ mới",
      listenWordAria: "Nghe từ {word}",
      exitSessionButton: "Thoát phiên học",
      cardPositionLabel: "Thẻ số {current} trên {total}",
      nothingToReviewTitle: "Chưa có thẻ nào cần ôn",
      nothingToReviewDescription:
        "Bạn đã ôn hết các thẻ đến hạn của bộ này. Quay lại sau khi có thẻ tới lượt ôn.",
      backToDeckButton: "Về bộ thẻ",
      setNameColumn: "Bộ từ vựng",
      cardCountColumn: "Số từ",
      dueTodayColumn: "Cần ôn hôm nay",
      lastStudiedColumn: "Lần học cuối",
      viewButton: "Xem",
    },
    pronunciation: {
      title: "Luyện phát âm",
      subtitle:
        "Phân tích sóng âm giọng nói theo thời gian thực, đối chiếu khẩu hình chuẩn và chấm điểm chi tiết từng âm vị IPA.",
      ipaBadge: "Chấm điểm âm vị",
      micReady: "Microphone sẵn sàng",
      startRecording: "Bắt đầu ghi âm",
      stopRecording: "Dừng ghi âm",
      listening: "Đang lắng nghe...",
      processingAI: "AI đang phân tích khẩu hình và âm vị...",
      nativeAudio: "Phát âm mẫu",
      yourAudio: "Bản ghi âm của bạn",
      waveformTitle: "Phân tích phổ âm thanh",
      phonemeBreakdown: "Chi tiết các âm vị IPA",
      intonationScore: "Ngữ điệu",
      fluencyScore: "Độ lưu loát",
      overallScore: "Điểm tổng quan",
      excellent: "Rất chuẩn xác!",
      goodEffort: "Khá tốt, hãy cải thiện một chút nữa",
      needPractice: "Cần chú ý khẩu hình và bật hơi",
      tryAgain: "Luyện đọc lại",
      nextExercise: "Câu tiếp theo",
      vowels: "Nguyên âm",
      consonants: "Phụ âm",
      diphthongs: "Nguyên âm đôi",
      lessonsList: "Danh sách bài học phát âm",
    },
    dailyPath: {
      title: "Lộ trình học tập mỗi ngày",
      subtitle:
        "Hệ thống tự động điều chỉnh độ khó và bài học hàng ngày dựa trên tiến độ và khả năng hấp thu của bạn.",
      roadmapTab: "Lộ trình hôm nay",
      quizCatalogueTab: "Thử thách trắc nghiệm",
      streakTitle: "Chuỗi ngày liên tiếp",
      streakSubtitle: "Học đều đặn mỗi ngày để duy trì ngọn lửa đam mê!",
      dailyQuestsTitle: "Nhiệm vụ trong ngày",
      dailyQuestsSubtitle: "Hoàn thành các nhiệm vụ để nhận thêm điểm thưởng",
      claimReward: "Nhận phần thưởng",
      claimed: "Đã nhận",
      startNode: "Bắt đầu bài học",
      reviewNode: "Ôn lại kiến thức",
      lockedNode: "Chưa mở khóa",
      nextMilestone: "Cột mốc tiếp theo",
      allQuizzes: "Tất cả bài tập",
      quizDifficulty: "Độ khó",
    },
    quiz: {
      questionNumber: "Câu hỏi",
      timer: "Thời gian làm bài",
      submitExam: "Nộp bài kiểm tra",
      nextQuestion: "Câu kế tiếp",
      prevQuestion: "Câu trước",
      chooseOption: "Chọn đáp án chính xác nhất",
      fillPlaceholder: "Nhập từ còn thiếu vào đây...",
      rewritePlaceholder: "Viết lại câu hoàn chỉnh...",
      reorderInstruction: "Kéo thả hoặc click để sắp xếp các từ thành câu đúng",
      matchingInstruction: "Ghép các cặp từ hoặc định nghĩa tương ứng",
      explanation: "Giải thích chi tiết",
      summaryTitle: "Tổng kết kết quả bài tập",
      summarySubtitle: "Xem lại điểm số và các câu cần khắc phục",
      correctAnswers: "Số câu trả lời đúng",
      xpEarned: "Điểm thưởng nhận được",
      retakeQuiz: "Làm lại bài này",
      backToRoadmap: "Trở về lộ trình chính",
    },
    dictation: {
      title: "Luyện nghe chép chính tả",
      subtitle:
        "Nâng cao độ nhạy thính giác và sự chính xác câu từ bằng phương pháp nghe và gõ lại từng câu.",
      listeningBadge: "Kỹ năng nghe hiểu",
      lessonsTab: "Danh sách bài học",
      statsTab: "Thống kê chi tiết",
      playSpeed: "Tốc độ phát",
      replaySentence: "Phát lại câu này",
      inputPlaceholder: "Gõ những gì bạn vừa nghe được tại đây...",
      checkAnswer: "Kiểm tra kết quả",
      nextSentence: "Sang câu tiếp theo",
      charHint: "Gợi ý chữ cái",
      originalAudio: "Đoạn âm thanh gốc",
      comparisonTitle: "So sánh khác biệt chi tiết",
      yourInput: "Nội dung bạn đã gõ",
      correctTranscript: "Bản ghi chuẩn xác",
      spellingErrors: "Các ký tự/từ sai",
      accuracyScore: "Độ chính xác",
      wpmSpeed: "Tốc độ gõ",
      practiceAgain: "Luyện nghe lại bài này",
      gridView: "Chế độ xem dạng lưới",
      listView: "Chế độ xem dạng danh sách",
      wordDiffResult: "Kết quả đối chiếu từng từ",
      mistakesTitle: "Từ hay gõ sai",
      difficultSentencesTitle: "Các câu thử thách cần chú ý",
      historyTitle: "Lịch sử các buổi luyện tập",
      sessionMetricsTitle: "Chi tiết phiên học",
      replaysCount: "Số lần nghe lại",
      hintsUsedCount: "Số gợi ý đã dùng",
      accuracyBreakdown: "Phân bổ độ chính xác",
      accuracyOverTime: "Độ chính xác theo thời gian",
      practiceActivity: "Hoạt động luyện tập",
      sessionCompletedBadge: "Đã hoàn thành phiên học",
      sessionCompletedTitle: "Hoàn thành bài luyện nghe chép chính tả!",
      overallAccuracy: "Độ chính xác tổng quan",
      wordsCorrect: "Số từ gõ đúng",
      sentencesCompleted: "Câu đã hoàn thành",
      studyDuration: "Thời gian luyện tập",
      reviewMistakes: "Xem lại các từ chưa đúng",
      replaysBadge: "Đã nghe lại: {count} lần",
      back5Aria: "Lùi lại 5 giây",
      pauseAria: "Tạm dừng",
      playAudioAria: "Phát âm thanh",
      forward5Aria: "Tua tới 5 giây",
      speedLabel: "Tốc độ",
      chartsEmptyState: "Chưa có dữ liệu. Luyện vài câu để thấy biểu đồ.",
      sentencesPerDayLabel: "Số câu / ngày",
      sentencesPracticedSuffix: "câu đã luyện",
      perfectScoreTitle: "Xuất sắc! Bạn đã gõ đúng 100%",
      wordsNeedCorrection: "{count} từ cần chú ý sửa lại",
      accuracyDetail: "Độ chính xác: {percent}% ({correct} / {total} từ đúng)",
      legendCorrect: "Từ đúng",
      legendIncorrect: "Từ sai",
      legendMissing: "Từ còn thiếu",
      fullSentenceLabel: "Toàn bộ câu mẫu:",
      tokensToFixLabel: "Các từ cần sửa:",
      mistakesOnlySegment: "Chỉ từ lỗi",
      fullSentenceSegment: "Cả câu mẫu",
      noErrorsDetected: "Không có từ lỗi nào cần sửa!",
      replayAudioButton: "Nghe lại câu này",
      finishAndViewResults: "Hoàn thành & Xem kết quả",
      filterByTopicAria: "Lọc theo chủ đề",
      filterByLevelAria: "Lọc theo cấp độ",
      filterByStatusAria: "Lọc theo trạng thái",
      sortLessonsAria: "Sắp xếp bài học",
      noHardSentences: "Chưa có câu nào khó với bạn.",
      avgAccuracyPrefix: "Chính xác TB",
      attemptsSuffix: "lần thử",
      practiceButton: "Luyện tập",
      hintWordCountLabel: "Xem số lượng từ trong câu",
      wordsUnit: "từ",
      hintFirstLettersLabel: "Gợi ý các chữ cái đầu tiên",
      hintRevealWordLabel: "Mở khóa 1 từ khóa quan trọng",
      hintTranslationLabel: "Xem bản dịch tiếng Việt",
      hintPartialTranscriptLabel: "Xem trích đoạn đầu của câu",
      collapseHints: "Thu gọn gợi ý",
      needHint: "Bạn cần gợi ý?",
      hintsUsedBadge: "Đã dùng: {count} gợi ý",
      hintsCounterNote:
        "* Mỗi gợi ý được mở sẽ tính vào số gợi ý đã dùng trong thống kê buổi học.",
      unlockHint: "Mở xem",
      dateColumn: "Thời gian",
      lessonColumn: "Bài học",
      sentencesColumn: "Số câu",
      durationColumn: "Thời lượng",
      hintsColumn: "Gợi ý dùng",
      actionColumn: "Xem lại",
      noSessionsYet: "Chưa có buổi luyện tập nào.",
      detailsButton: "Chi tiết",
      wordsTypedCount: "{count} từ đã gõ",
      toCheckHint: "để kiểm tra",
      skipButton: "Bỏ qua",
      minutesUnit: "phút",
      notPractisedYet: "Chưa luyện",
      practisedToday: "Hôm nay",
      practisedYesterday: "Hôm qua",
      daysAgoSuffix: "ngày trước",
      sentenceCountSuffix: "câu",
      practiceAgainShort: "Luyện lại",
      continueButton: "Tiếp tục",
      topicColumn: "Chủ đề",
      difficultyColumn: "Độ khó",
      progressColumn: "Tiến độ",
      wordColumn: "Từ vựng",
      missesColumn: "Số lần gõ sai",
      correctColumn: "Số lần gõ đúng",
      noMissedWords: "Chưa có từ nào bạn hay gõ sai.",
      exampleLabel: "Ví dụ:",
      timesUnit: "lần",
      allMistakesClearedTitle: "Xuất sắc! Bạn đã vượt qua tất cả câu sai!",
      allMistakesClearedDescription:
        "Không còn câu nào bạn hay sai. Cứ luyện tiếp, danh sách này sẽ tự cập nhật.",
      backToLessonsButton: "Quay lại thư viện bài học",
      mistakePracticeBadge: "Luyện tập câu sai",
      queueCountLabel: "{count} câu cần ôn tập trong danh sách",
      queuePositionLabel: "Câu {current} / {total}",
      bestAttemptSummary: "Tốt nhất {percent}% sau {count} lần thử",
      clearMistakeHint:
        "Nghe lại và gõ đúng để gỡ câu này khỏi danh sách câu sai.",
      lastTypedPrefix: "Lần trước bạn gõ: ",
      correctAnswerReveal: 'Đáp án chuẩn: "{text}" ({percent}%)',
      checkFailedMessage:
        "Chưa chấm được câu này. Kiểm tra kết nối rồi bấm kiểm tra lại.",
      clearedFeedback: "Chính xác! Câu này sẽ được gỡ khỏi danh sách lỗi.",
      notQuiteFeedback: "Chưa hoàn toàn chính xác. Hãy nghe lại lần nữa nhé!",
      continueToNextButton: "Tiếp tục gỡ câu tiếp theo",
      tryNextButton: "Thử lại câu tiếp theo",
      reviewMistakesCount: "Luyện câu sai ({count})",
      hintsUnit: "gợi ý",
      perfectSentencesLabel: "Câu chuẩn xác 100%:",
      sentencesWithMistakesLabel: "Câu có từ chưa chuẩn:",
      sentencesToReviewTitle: "Các câu có lỗi cần ôn tập ({count})",
      startReviewingMistakes: "Bắt đầu ôn tập câu sai",
      zeroMistakesMessage: "Tuyệt vời! Bạn không mắc phải lỗi nào trong bài học này.",
      yourInputShort: "Bạn đã gõ:",
      correctAnswerShort: "Đáp án đúng:",
      backToLessonCatalog: "Về danh sách bài học",
      completedLessonsLabel: "Bài học đã hoàn thành",
      lessonsUnit: "bài",
      averageAccuracyLabel: "Độ chính xác trung bình",
      overallSentencesUnit: "trên tổng số câu",
      listeningHoursLabel: "Thời gian luyện nghe",
      focusedPracticeUnit: "luyện tập trung",
      sentencesPracticedLabel: "Số câu đã thực hành",
      sentencesCompletedUnit: "câu hoàn thành",
      statsPageTitle: "Thống kê quá trình học",
      period7Days: "7 ngày qua",
      period30Days: "30 ngày qua",
      period3Months: "3 tháng qua",
      periodAllTime: "Tất cả",
      noLessonsPublished: "Chưa có bài nghe nào được phát hành. Quay lại sau nhé.",
      noLessonsMatchFilters:
        "Không có bài nào khớp bộ lọc. Thử đổi chủ đề, trình độ hoặc trạng thái.",
      couldNotLoadLessons: "Không tải được bài học",
      checkConnectionReload: "Kiểm tra kết nối rồi tải lại trang.",
      backToLibraryButton: "Trở về Thư viện",
    },
    exam: {
      title: "Thư viện đề thi thử",
      subtitle:
        "Bộ đề thi mô phỏng định dạng chuẩn quốc tế với chấm điểm tức thì và phân tích chuyên sâu.",
      allExams: "Tất cả đề thi",
      ieltsTab: "Đề thi IELTS",
      toeicTab: "Đề thi TOEIC",
      fullTest: "Đề thi đầy đủ",
      miniTest: "Đề thi rút gọn",
      startExam: "Bắt đầu làm bài",
      durationMinutes: "phút",
      totalQuestions: "câu hỏi",
      participants: "lượt thi",
      flagQuestionTip:
        "Bạn có thể đánh dấu cờ các câu chưa chắc chắn để xem lại trước khi nộp bài.",
      mockTestBadge: "Mock Test · Thư viện đề",
      officialExamsUnit: "Bộ đề thi thật",
      autoGradingLabel: "Chấm tự động",
      aiAnalysisLabel: "Phân tích điểm",
      searchPlaceholder: "Tìm theo tên đề hoặc bộ đề…",
      clearSearchAria: "Xoá từ khoá tìm kiếm",
      sortByLabel: "Sắp xếp:",
      sortNewest: "Mới nhất",
      sortLevelAsc: "Độ khó: Dễ → Khó",
      sortLevelDesc: "Độ khó: Khó → Dễ",
      sortScoreDesc: "Điểm cao nhất",
      skillAll: "Kỹ năng: Tất cả",
      diffAll: "Độ khó: Tất cả",
      statusAll: "Trạng thái: Tất cả",
      clearFilters: "Xoá bộ lọc",
      clearAllFilters: "Xoá toàn bộ bộ lọc",
      tabAll: "Tất cả đề thi",
      examsCountUnit: "đề thi",
      notStarted: "Chưa làm",
      inProgress: "Đang làm dở",
      completed: "Đã hoàn thành",
      generalSkill: "Tổng hợp",
      mockTestFallback: "Đề thi thử",
      questionsUnit: "câu",
      minutesUnit: "phút",
      bestScoreLabel: "Điểm cao nhất",
      maxScoreLabel: "Điểm tối đa",
      pointsUnit: "điểm",
      retakeAction: "Làm lại",
      continueAction: "Làm tiếp",
      startAction: "Bắt đầu làm bài",
      emptyTitle: "Không tìm thấy đề thi phù hợp",
      emptySearchDesc:
        'Không có đề thi nào khớp với từ khoá "{query}". Thử điều chỉnh từ khoá hoặc xoá bớt các bộ lọc để xem nhiều kết quả hơn.',
      emptyFilterDesc:
        "Không có đề thi nào thoả mãn các điều kiện lọc hiện tại. Thử bỏ chọn một vài bộ lọc để xem danh sách đề.",
      backToLibrary: "Thư viện đề",
      defaultDescription:
        "Đề thi thử chuẩn định dạng quốc tế giúp bạn đánh giá chính xác năng lực và quen với áp lực thời gian.",
      examTimeLabel: "Thời gian làm bài",
      questionQuantityLabel: "Số lượng câu",
      questionsUnitFull: "câu hỏi",
      maxScoreScaleLabel: "Thang điểm tối đa",
      passScoreLabel: "Điểm đạt",
      passScoreUnset: "Không đặt",
      sectionsCountLabel: "Số phần thi",
      sectionsUnit: "phần thi",
      examStructureLabel: "Cấu trúc bài thi:",
      sectionPrefix: "Phần",
      sectionIncludes: "Bao gồm {parts} part · {questions} câu hỏi",
      allocatedTimeLabel: "Thời gian quy định:",
      rulesTitle: "Quy định & hướng dẫn làm bài:",
      rule1:
        "Đồng hồ đếm ngược sẽ bắt đầu chạy ngay khi bạn nhấn Bắt đầu làm bài.",
      rule2:
        "Sử dụng bảng điều hướng câu hỏi bên phải để theo dõi trạng thái các câu hỏi và nhảy nhanh tới bất kỳ câu nào.",
      rule3:
        "Bạn có thể đánh dấu cờ các câu chưa chắc chắn để xem lại trước khi nộp bài.",
      rule4:
        "Sau khi nộp bài, hệ thống sẽ chấm điểm và cung cấp đáp án cùng giải thích chi tiết cho từng câu hỏi.",
      returnToLibrary: "Quay lại thư viện",
      exitExam: "Thoát",
      progress: "Tiến độ",
      submitExamCTA: "Nộp bài",
      exitConfirm:
        "Bạn có chắc chắn muốn thoát? Bài làm hiện tại sẽ không được lưu.",
      listeningSection: "Phần Nghe",
      audioStimulus: "Audio bài nghe:",
      questionPrefix: "Câu",
      flag: "Gắn cờ",
      flagged: "Đã gắn cờ",
      prevQuestion: "Câu trước",
      nextQuestion: "Câu tiếp theo",
      paletteTitle: "Bảng câu hỏi",
      paletteCompleted: "{answered}/{total} đã làm",
      legendAnswered: "Đã làm",
      legendFlagged: "Gắn cờ",
      legendUnanswered: "Chưa làm",
      questionAria: "Câu {index}",
      confirmModalTitle: "Xác nhận nộp bài thi",
      unansweredWarning: "Bạn còn {count} câu hỏi chưa trả lời!",
      allDoneNotice: "Bạn đã hoàn thành tất cả {count} câu hỏi!",
      submitExplanation:
        "Sau khi xác nhận nộp bài, hệ thống sẽ kết thúc lượt thi và chuyển đến màn hình kết quả đánh giá cùng giải thích đáp án.",
      continueDoing: "Tiếp tục làm bài",
      confirmSubmitCTA: "Xác nhận nộp bài",
      resultTitlePrefix: "Kết quả:",
      finishedBadge: "Hoàn thành bài thi",
      estimatedScore: "Điểm số ước tính",
      accuracyRate: "Độ chính xác:",
      correctAnswersCount: "Số câu đúng",
      outOfTotal: "Trên tổng {total} câu",
      incorrectAnswersCount: "Số câu sai",
      reviewNeeded: "Cần xem lại giải thích",
      timeSpentLabel: "Thời gian làm",
      skippedCount: "Bỏ qua: {count} câu",
      minutesText: "phút",
      secondsText: "giây",
      explanationsTitle: "Đáp án & Giải thích chi tiết",
      explanationsDesc:
        "Xem lại toàn bộ câu hỏi kèm đáp án đúng và phân tích lý do",
      tabAllReview: "Tất cả",
      tabCorrect: "Đúng",
      tabIncorrect: "Sai",
      tabSkipped: "Chưa làm",
      correctBadge: "Đáp án đúng",
      yourChoiceBadge: "Lựa chọn của bạn",
      detailedExplanation: "Giải thích chi tiết:",
      retakeCTA: "Làm lại",
      notFoundQuestion: "Không tìm thấy dữ liệu câu hỏi.",
      failedLoadExam: "Không thể tải đề thi",
      failedLoadExamDesc:
        "Đề thi không tồn tại hoặc bạn chưa có quyền truy cập.",
      showingRange: "Hiển thị {start} - {end} của {total} đề thi",
      loadListError: "Không thể tải danh sách đề thi",
    },
    home: {
      heroBadge: "Luyện thi IELTS · TOEIC theo lộ trình của riêng bạn",
      heroTitle: "Chinh phục tiếng Anh",
      heroTitleAccent: "cùng Englow3",
      heroQuote: "Con đường của riêng bạn, tương lai trong tay bạn",
      heroDescription:
        "Học từ vựng theo cấp độ CEFR, luyện nghe chép chính tả, chấm phát âm bằng AI và làm đề thi thử IELTS/TOEIC - tất cả gói trong một lộ trình mỗi ngày dành riêng cho bạn.",
      heroCta: "Bắt đầu học ngay",
      heroSecondaryCta: "Khám phá tính năng",
      heroImageAlt:
        "Không gian học tập Englow3 với phân tích phát âm, bộ thẻ ghi nhớ và trình theo dõi tiến độ hàng ngày",
      highlightsAria: "Englow3 bao gồm những gì",
      highlights: [
        { value: "A1 → C1", label: "Từ vựng theo 5 cấp độ CEFR" },
        { value: "IELTS · TOEIC", label: "Đề thi thử đúng định dạng" },
        { value: "4 kỹ năng", label: "Nghe · Nói · Đọc · Viết" },
        { value: "SRS", label: "Ôn lại đúng lúc sắp quên" },
      ],
      featuresEyebrow: "Tính năng",
      featuresTitle: "Mọi thứ bạn cần để luyện tiếng Anh mỗi ngày",
      featuresSubtitle:
        "Mỗi công cụ tập trung vào một kỹ năng, và tất cả cùng đổ về một lộ trình.",
      features: [
        {
          title: "Luyện phát âm với AI",
          description:
            "Ghi âm một câu, nhận điểm chi tiết đến từng âm IPA và biết chính xác âm nào cần sửa.",
        },
        {
          title: "Thẻ ghi nhớ 3D",
          description:
            "Học từ vựng theo cấp độ, ôn lại bằng thuật toán lặp lại ngắt quãng để nhớ lâu hơn.",
        },
        {
          title: "Nghe chép chính tả",
          description:
            "Nghe từng câu, gõ lại và thấy ngay từ nào nghe sai. Câu sai được gom lại để ôn.",
        },
        {
          title: "Thi thử IELTS & TOEIC",
          description:
            "Làm đề đúng định dạng, có bấm giờ, chấm điểm tự động và xem lại từng câu.",
        },
        {
          title: "Gia sư AI",
          description:
            "Hỏi về ngữ pháp, từ vựng hay nhờ sửa câu - gia sư trả lời ngay, bất cứ lúc nào.",
        },
        {
          title: "Lộ trình hằng ngày",
          description:
            "Mỗi ngày một danh sách vừa sức: thẻ đến hạn, bài nghe dở và bài trắc nghiệm chưa đạt.",
        },
      ],
      stepsEyebrow: "Bắt đầu",
      stepsTitle: "Ba bước để vào guồng",
      steps: [
        {
          title: "Tạo tài khoản",
          description: "Đăng ký bằng email, chưa tới một phút.",
        },
        {
          title: "Chọn mục tiêu",
          description:
            "Cho biết bạn học để làm gì, trình độ hiện tại và kỹ năng muốn tập trung.",
        },
        {
          title: "Học mỗi ngày",
          description:
            "Làm theo lộ trình hằng ngày, thi thử để đo tiến bộ và điều chỉnh mục tiêu.",
        },
      ],
      ctaTitle: "Sẵn sàng bắt đầu lộ trình của riêng bạn?",
      ctaSubtitle: "Chỉ mất một phút để đặt mục tiêu. Englow3 lo phần còn lại.",
      footerTagline: "Con đường của riêng bạn, tương lai trong tay bạn.",
      footerProject: "Đồ án tốt nghiệp",
    },
    auth: {
      loginTitle: "Chào mừng trở lại",
      loginSubtitle: "Con đường của riêng bạn, tương lai trong tay bạn",
      loginSocial: "Hoặc đăng nhập bằng",
      noAccountPrompt: "Chưa có tài khoản?",
      registerAction: "Đăng ký ngay",
      registerTitle: "Tạo tài khoản Englow3",
      registerSubtitle:
        "Tham gia vào con đường chinh phục tiếng anh cùng Englow3",
      registerSocial: "Hoặc đăng ký bằng",
      hasAccountPrompt: "Đã có tài khoản?",
      loginAction: "Đăng nhập",
      emailLabel: "Email",
      emailPlaceholder: "example@example.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "Nhập mật khẩu của bạn",
      rememberMe: "Ghi nhớ đăng nhập",
      forgotPassword: "Quên mật khẩu?",
      loginSubmit: "Đăng nhập",
      fullNameLabel: "Họ và tên",
      fullNamePlaceholder: "Nguyễn Văn A",
      nicknameLabel: "Nickname",
      nicknameHint: "hiển thị công khai",
      nicknamePlaceholder: "vana",
      passwordRegisterHint: "8+ ký tự, hoa, thường, ký tự đặc biệt",
      createPasswordPlaceholder: "Tạo mật khẩu",
      birthDateLabel: "Ngày sinh",
      dayLabel: "Ngày",
      monthLabel: "Tháng",
      yearLabel: "Năm",
      genderLabel: "Giới tính",
      termsAgreementPre: "Tôi đồng ý với",
      termsOfService: "Điều khoản sử dụng",
      andWord: "và",
      privacyPolicy: "Chính sách bảo mật",
      termsAgreementPost: "của Englow3.",
      createAccountSubmit: "Tạo tài khoản",
      closeAria: "Đóng",
    },
  },
  en: {
    nav: {
      study: "Study",
      exams: "Mock Exams",
      aiTutor: "AI Tutor",
      pronunciation: "Pronunciation",
      pronunciationDesc: "Real-time AI pronunciation evaluation",
      flashcards: "Flashcards",
      flashcardsDesc: "3D cards tailored to your memory retention",
      dictation: "Dictation",
      dictationDesc: "Listen and transcribe challenge",
      dailyPath: "Daily Path",
      dailyPathDesc: "Adaptive learning journey customized for you",
      profile: "My Profile",
      settings: "Account Settings",
      logout: "Log out",
      login: "Sign in",
      home: "Home",
      account: "Account",
      completeOnboarding: "Complete Profile",
    },
    common: {
      save: "Save Changes",
      cancel: "Cancel",
      continue: "Continue",
      back: "Back",
      start: "Start",
      finish: "Finish",
      submit: "Submit",
      hint: "Hint",
      search: "Search...",
      filter: "Filter",
      all: "All",
      loading: "Loading data...",
      error: "An error occurred",
      retry: "Try Again",
      success: "Operation successful",
      viewAll: "View All",
      level: "Level",
      score: "Score",
      accuracy: "Accuracy",
      timeRemaining: "Time Remaining",
      completed: "Completed",
      inProgress: "In Progress",
      locked: "Locked",
      status: "Status",
      copied: "Copied!",
      notFoundTitle: "This {thing} does not exist",
      notFoundDescription:
        "It may have been removed, or the link is wrong. Pick one from the library instead.",
      loadErrorTitle: "Could not load this {thing}",
      loadErrorDescription: "The server did not answer. Try again in a few minutes.",
      languageSwitcherTooltip: "Switch UI language",
      languageSwitcherMenuLabel: "Interface Language",
      reset: "Reset",
    },
    account: {
      title: "My Profile",
      subtitle:
        "Manage your account settings, target goals, and personalized learning preferences on Englow3",
      personalInfoTab: "Personal Information",
      learningTab: "Roadmap & Targets",
      securityTab: "Account & Security",
      fullName: "Full Name",
      displayName: "Display Name",
      gender: "Gender",
      male: "Male",
      female: "Female",
      otherGender: "Other",
      birthDate: "Date of Birth",
      saveChanges: "Save Profile",
      saving: "Saving...",
      updateSuccessTitle: "Update Successful",
      updateSuccessMessage: "Your profile information has been updated.",
      updateErrorTitle: "Could not save profile",
      memberSince: "Member Since",
      targetGoal: "Current Target",
      targetDate: "Target Exam Date",
      currentBand: "Current Score",
      targetBand: "Target Score",
      streakDays: "Day Streak",
      totalHours: "Total Study Hours",
      completedLessons: "Completed Lessons",
      email: "Email Address",
      password: "Password",
      changePassword: "Change Password",
      twoFactor: "Two-Factor Authentication (2FA)",
      twoFactorDesc: "Enhance account security with verification codes",
      activeSessions: "Active Sessions",
      logoutAll: "Sign out from all devices",
      accountPasswordTitle: "Account Password",
      accountPasswordDesc:
        "Protect your account with a strong, unique password",
      sendResetEmail: "Send Password Reset Link",
      resetLinkValidNotice:
        "For security, password reset links remain valid for 24 hours. Check your Spam folder if not received in Inbox.",
      sendingEmail: "Sending email...",
      sendingEmailDesc: "Please wait a moment...",
      resetEmailSentTitle: "Email Sent Successfully",
      resetEmailSentDesc:
        "A password reset link has been dispatched to your email. Please check your inbox.",
      resetEmailErrorTitle: "Failed to Send Email",
      connectionErrorTitle: "Connection Error",
      connectionErrorDesc:
        "Could not establish connection to authentication provider.",
      activeSessionsTitle: "Active Sessions & Devices",
      activeSessionsDesc:
        "Devices and sessions currently authenticated with your account",
      currentBrowser: "Current Web Browser",
      activeNow: "Active Now",
      supabaseAuthNotice:
        "Authenticated securely via Englow3 security services",
      secureSession: "Secure Session",
      onboardingReady: "Ready to Learn",
      onboardingStepLearningPurposes: "Learning Purposes",
      onboardingStepCertificateTarget: "Certificate Target",
      onboardingStepLearningGoal: "Score Goal",
      studentId: "Student ID",
      clickToCopyId: "Click to copy ID",
      learningTargetsCardTitle: "Learning Targets",
      targetScoreLabel: "Target Score",
      currentLevelLabel: "Current Level",
      targetSkillsLabel: "Target Skills",
      certificateNotSelected: "None",
      levelNotAssessed: "Not assessed",
      updateLearningGoalsButton: "Update Learning Goals",
      skillListening: "Listening",
      skillReading: "Reading",
      skillWriting: "Writing",
      skillSpeaking: "Speaking",
      skillGrammar: "Grammar",
      skillVocabulary: "Vocabulary",
      skillPronunciation: "Pronunciation",
      notConfigured: "Not configured",
      targetScoreEmpty: "None",
      learningRoadmapTitle: "Learning Roadmap & Targets",
      targetCertificateLabel: "Target Certificate",
      goalPrefix: "Goal",
      cefrEvaluationBadge: "CEFR Evaluation",
      targetDeadlineLabel: "Target Deadline",
      flexibleDeadline: "Flexible",
      adaptiveScheduleBadge: "Adaptive Schedule",
      prioritySkillsTitle: "Priority Focus Skills",
      noSkillsSelectedHint:
        'No specific skills selected yet. Click "Update Learning Goals" to configure.',
      profileLoadErrorTitle: "Could not load profile",
      profileLoadErrorDescription:
        "An error occurred while loading profile details. Please verify your connection or sign in again.",
      notSignedInTitle: "Not Signed In",
      notSignedInDescription:
        "Please sign in to view and edit your profile settings.",
      saveErrorFallback: "Error saving profile",
      fullNamePlaceholder: "e.g. John Doe",
      displayNamePlaceholder: "e.g. jdoe",
      selectGenderPlaceholder: "Select gender",
      emailFieldDescription:
        "Email is used for account login and notifications, cannot be edited here",
    },
    flashcard: {
      title: "3D Flashcards",
      subtitle:
        "Retain vocabulary long-term with science-backed spaced repetition and tactile 3D flipping.",
      srsBadge: "SRS Algorithm",
      decksTab: "Vocabulary Decks",
      statsTab: "Retention & Stats",
      dueToday: "Due for Review Today",
      streak: "Daily Study Streak",
      retentionRate: "Retention Rate",
      startReview: "Start Review Now",
      searchPlaceholder: "Search decks by title or topic...",
      topicAll: "All Topics",
      sortBy: "Sort by",
      sortDue: "Most Due Today",
      sortProgress: "Highest Progress",
      sortCards: "Card Count",
      flipCard: "Flip Card",
      flipBack: "Flip Back",
      showMeaning: "Show Definition",
      phonetic: "Phonetics",
      example: "Example Sentence",
      again: "Repeat",
      hard: "Hard",
      good: "Good",
      easy: "Easy",
      mastered: "Mastered",
      learning: "Learning",
      newCards: "New Cards",
      totalCards: "Total Cards",
      deckProgress: "Deck Progress",
      difficultWords: "Tricky Words",
      studySessionComplete: "Review Session Complete!",
      studySessionDesc:
        "You have reviewed all due cards for today. Keep up the great streak!",
      returnToDecks: "Return to Decks",
      frontVocab: "Vocabulary (Front)",
      backMeaning: "Definition (Back)",
      needsAttention: "Needs Attention",
      memoryStages: "Memory Retention Stages",
      newCardsBadge: "New Cards",
      reviewHintSpace:
        "Press Space or click card to reveal definition and examples",
      flipPrompt: "Flip card to reveal answer",
      assessRetentionLabel: "ASSESS RETENTION LEVEL (Keys 1 - 4):",
      ratingAgainHint: "Again (< 1 day)",
      ratingHardHint: "Hard (2 days)",
      ratingGoodHint: "Good (4 days)",
      ratingEasyHint: "Easy (7 days)",
      needsReviewBadge: "Needs review ({count} misses)",
      listenNativeAudioTooltip: "Listen to native audio",
      listenAudioAria: "Listen audio",
      pronounceWordAria: "Pronounce word",
      flipHintFooter: "Press Space or tap card to flip and view definition",
      listenAgainAria: "Listen again",
      vietnameseMeaningLabel: "VIETNAMESE MEANING:",
      englishDefinitionLabel: "ENGLISH DEFINITION:",
      contextExampleLabel: "CONTEXT EXAMPLE:",
      memoryMnemonicLabel: "MEMORY MNEMONIC:",
      rateRetentionFooter: "Rate your retention below for optimal spaced repetition",
      cardsReviewedPerDay: "Cards reviewed per day",
      noReviewsInPeriod: "No reviews in this period yet.",
      priorityWordsBadge: "{count} priority words",
      deckColumn: "Deck",
      missesColumnShort: "Misses",
      lastReviewColumn: "Last Review",
      audioColumn: "Audio",
      noForgottenWords: "No words you keep forgetting yet.",
      missCountBadge: "{count} times",
      allTopicsChip: "All",
      dailyConversationChip: "Daily Conversation",
      travelChip: "Travel",
      gridViewTooltip: "Grid view",
      gridViewAria: "Grid view",
      listViewTooltip: "List view",
      listViewAria: "List view",
      streakDaysBanner: "{count}-day streak",
      cardsDueTodayMessage: "You have {count} cards due for review today!",
      nothingDueTodayMessage: "Nothing is due for review today.",
      startReviewCount: "Start Review ({count} cards)",
      learnNewCardsButton: "Learn new cards",
      noSetsToStudyButton: "No sets to study yet",
      dueTodayLabel: "Due today:",
      cardsUnit: "cards",
      retentionRateLabel: "Retention rate:",
      notStudiedYet: "Not started",
      studiedToday: "Today",
      studiedYesterday: "Yesterday",
      daysAgoSuffix: "days ago",
      wordsCountSuffix: "words",
      dueCardsBadge: "{count} due",
      reviewButton: "Review",
      studyButton: "Study",
      noSetsPublished: "No flashcard sets have been published yet. Check back soon.",
      noSetsMatchFilters:
        "No sets match these filters. Try another search or topic.",
      couldNotLoadSets: "Could not load flashcard sets",
      period7DaysShort: "7 days",
      period30DaysShort: "30 days",
      period3MonthsShort: "3 months",
      periodAllTimeShort: "All time",
      backToDecksButton: "Back to Decks",
      studyDeckNowButton: "Study Deck Now",
      cardsDueTodayBadge: "{count} cards due today",
      completedForTodayBadge: "Completed for today",
      totalCardsLabel: "Total cards:",
      lastStudiedLabel: "Last studied:",
      masteredColonLabel: "Mastered:",
      deckWordListTitle: "Card list in deck ({count} cards)",
      clickSpeakerHint: "Click speaker icon to listen to native pronunciation",
      ipaColumn: "IPA",
      partOfSpeechColumn: "Part of Speech",
      definitionColumn: "Definition",
      englishMeaningColumn: "English Meaning",
      statusColumn: "Status",
      reviewStatusBadge: "Review",
      learningStatusBadge: "Learning",
      newStatusBadge: "New",
      listenWordAria: "Listen to {word}",
      exitSessionButton: "Exit session",
      cardPositionLabel: "Card {current} of {total}",
      nothingToReviewTitle: "Nothing to review yet",
      nothingToReviewDescription:
        "You have reviewed every card that is due in this deck. Come back when more are due.",
      backToDeckButton: "Back to the deck",
      setNameColumn: "Deck",
      cardCountColumn: "Cards",
      dueTodayColumn: "Due Today",
      lastStudiedColumn: "Last Studied",
      viewButton: "View",
    },
    pronunciation: {
      title: "Pronunciation",
      subtitle:
        "Real-time acoustic speech analysis, native mouth positioning comparison, and phoneme-level IPA scoring.",
      ipaBadge: "Phoneme Scoring",
      micReady: "Microphone AI Ready",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      listening: "Listening...",
      processingAI: "AI analyzing articulation and phonemes...",
      nativeAudio: "Native Pronunciation",
      yourAudio: "Your Recording",
      waveformTitle: "Acoustic Waveform Analysis",
      phonemeBreakdown: "IPA Phoneme Breakdown",
      intonationScore: "Intonation",
      fluencyScore: "Fluency",
      overallScore: "Overall Score",
      excellent: "Outstanding articulation!",
      goodEffort: "Good attempt, slight refinement needed",
      needPractice: "Focus on breath control and mouth shape",
      tryAgain: "Practice Again",
      nextExercise: "Next Sentence",
      vowels: "Vowels",
      consonants: "Consonants",
      diphthongs: "Diphthongs",
      lessonsList: "Pronunciation Lessons",
    },
    dailyPath: {
      title: "Adaptive Daily Learning Path",
      subtitle:
        "Intelligent daily lesson progression that dynamically scales in difficulty based on your mastery.",
      roadmapTab: "Today's Roadmap",
      quizCatalogueTab: "Quiz Challenges",
      streakTitle: "Day Streak",
      streakSubtitle: "Practice daily to keep your learning momentum active!",
      dailyQuestsTitle: "Daily Quests",
      dailyQuestsSubtitle:
        "Complete daily milestones to collect bonus experience",
      claimReward: "Claim Reward",
      claimed: "Claimed",
      startNode: "Start Lesson",
      reviewNode: "Review Material",
      lockedNode: "Locked",
      nextMilestone: "Next Milestone",
      allQuizzes: "All Exercises",
      quizDifficulty: "Difficulty",
    },
    quiz: {
      questionNumber: "Question",
      timer: "Time Elapsed",
      submitExam: "Submit Quiz",
      nextQuestion: "Next Question",
      prevQuestion: "Previous Question",
      chooseOption: "Select the best answer",
      fillPlaceholder: "Type the missing word here...",
      rewritePlaceholder: "Rewrite the full sentence...",
      reorderInstruction:
        "Drag and drop or click words to build the correct sentence",
      matchingInstruction: "Match corresponding items or definitions",
      explanation: "Detailed Explanation",
      summaryTitle: "Quiz Results Summary",
      summarySubtitle: "Review your score and areas for improvement",
      correctAnswers: "Correct Answers",
      xpEarned: "Experience Points Earned",
      retakeQuiz: "Retake Quiz",
      backToRoadmap: "Back to Daily Path",
    },
    dictation: {
      title: "Audio Dictation Practice",
      subtitle:
        "Sharpen listening comprehension and spelling precision by transcribing speech sentence by sentence.",
      listeningBadge: "Listening Skills",
      lessonsTab: "Lesson Catalog",
      statsTab: "Performance Stats",
      playSpeed: "Audio Speed",
      replaySentence: "Replay Sentence",
      inputPlaceholder: "Type exactly what you hear here...",
      checkAnswer: "Check Answer",
      nextSentence: "Next Sentence",
      charHint: "Letter Hint",
      originalAudio: "Original Audio Track",
      comparisonTitle: "Detailed Diff Comparison",
      yourInput: "Your Transcription",
      correctTranscript: "Official Transcript",
      spellingErrors: "Mismatched Tokens",
      accuracyScore: "Accuracy",
      wpmSpeed: "Typing Speed",
      practiceAgain: "Practice This Lesson Again",
      gridView: "Grid View",
      listView: "List View",
      wordDiffResult: "Detailed Token Diff Comparison",
      mistakesTitle: "Frequently Missed Words",
      difficultSentencesTitle: "Challenging Sentences",
      historyTitle: "Practice History",
      sessionMetricsTitle: "Session Metrics",
      replaysCount: "Audio Replays",
      hintsUsedCount: "Hints Utilized",
      accuracyBreakdown: "Accuracy Breakdown",
      accuracyOverTime: "Accuracy Over Time",
      practiceActivity: "Practice Activity",
      sessionCompletedBadge: "Session Completed",
      sessionCompletedTitle: "Dictation Session Completed!",
      overallAccuracy: "Overall Accuracy",
      wordsCorrect: "Correct Words",
      sentencesCompleted: "Completed Sentences",
      studyDuration: "Practice Duration",
      reviewMistakes: "Review Missed Words",
      replaysBadge: "Replays: {count}",
      back5Aria: "Back 5 seconds",
      pauseAria: "Pause",
      playAudioAria: "Play audio",
      forward5Aria: "Forward 5 seconds",
      speedLabel: "Speed",
      chartsEmptyState: "No data yet. Practise a few sentences to see the chart.",
      sentencesPerDayLabel: "Sentences / day",
      sentencesPracticedSuffix: "sentences practiced",
      perfectScoreTitle: "Outstanding! 100% Accuracy",
      wordsNeedCorrection: "{count} words need correction",
      accuracyDetail: "Accuracy: {percent}% ({correct} / {total} words correct)",
      legendCorrect: "Correct",
      legendIncorrect: "Incorrect",
      legendMissing: "Missing",
      fullSentenceLabel: "Full Target Sentence:",
      tokensToFixLabel: "Tokens to Fix:",
      mistakesOnlySegment: "Mistakes only",
      fullSentenceSegment: "Full sentence",
      noErrorsDetected: "No errors detected!",
      replayAudioButton: "Replay Audio",
      finishAndViewResults: "Finish & View Results",
      filterByTopicAria: "Filter by topic",
      filterByLevelAria: "Filter by level",
      filterByStatusAria: "Filter by status",
      sortLessonsAria: "Sort lessons",
      noHardSentences: "No sentences giving you trouble yet.",
      avgAccuracyPrefix: "Avg. Accuracy",
      attemptsSuffix: "attempts",
      practiceButton: "Practice",
      hintWordCountLabel: "Word count in sentence",
      wordsUnit: "words",
      hintFirstLettersLabel: "First letter of each word",
      hintRevealWordLabel: "Reveal 1 key word",
      hintTranslationLabel: "Vietnamese translation",
      hintPartialTranscriptLabel: "Sentence opening excerpt",
      collapseHints: "Collapse hints",
      needHint: "Need a hint?",
      hintsUsedBadge: "Used: {count} hints",
      hintsCounterNote:
        "* Each unlocked hint counts toward the hints used in session stats.",
      unlockHint: "Unlock",
      dateColumn: "Date",
      lessonColumn: "Lesson",
      sentencesColumn: "Sentences",
      durationColumn: "Duration",
      hintsColumn: "Hints",
      actionColumn: "Action",
      noSessionsYet: "No sessions yet.",
      detailsButton: "Details",
      wordsTypedCount: "{count} words typed",
      toCheckHint: "to check",
      skipButton: "Skip",
      minutesUnit: "mins",
      notPractisedYet: "Not started",
      practisedToday: "Today",
      practisedYesterday: "Yesterday",
      daysAgoSuffix: "days ago",
      sentenceCountSuffix: "sentences",
      practiceAgainShort: "Practise again",
      continueButton: "Continue",
      topicColumn: "Topic",
      difficultyColumn: "Difficulty",
      progressColumn: "Progress",
      wordColumn: "Word",
      missesColumn: "Misses",
      correctColumn: "Correct",
      noMissedWords: "No words you keep mistyping yet.",
      exampleLabel: "Example:",
      timesUnit: "times",
      allMistakesClearedTitle: "Great job! You cleared all mistakes!",
      allMistakesClearedDescription:
        "No sentences are giving you trouble. Keep practising and this list will fill itself.",
      backToLessonsButton: "Back to lessons",
      mistakePracticeBadge: "Mistake Practice",
      queueCountLabel: "{count} sentences to review in queue",
      queuePositionLabel: "Sentence {current} / {total}",
      bestAttemptSummary: "Best {percent}% over {count} attempts",
      clearMistakeHint:
        "Listen and type accurately to clear this sentence from mistakes.",
      lastTypedPrefix: "Last time you typed: ",
      correctAnswerReveal: 'Correct answer: "{text}" ({percent}%)',
      checkFailedMessage:
        "Could not check this one. Check your connection and try again.",
      clearedFeedback: "Correct! This sentence has been cleared from mistakes.",
      notQuiteFeedback: "Not quite right. Please listen and try again!",
      continueToNextButton: "Continue to next sentence",
      tryNextButton: "Try next sentence",
      reviewMistakesCount: "Review Mistakes ({count})",
      hintsUnit: "hints",
      perfectSentencesLabel: "100% Accurate Sentences:",
      sentencesWithMistakesLabel: "Sentences with Mistakes:",
      sentencesToReviewTitle: "Sentences to Review ({count})",
      startReviewingMistakes: "Review Mistakes",
      zeroMistakesMessage: "Awesome! You completed this session with zero mistakes.",
      yourInputShort: "Your Input:",
      correctAnswerShort: "Correct Answer:",
      backToLessonCatalog: "Back to Lesson Catalog",
      completedLessonsLabel: "Completed Lessons",
      lessonsUnit: "lessons",
      averageAccuracyLabel: "Average Accuracy",
      overallSentencesUnit: "overall sentences",
      listeningHoursLabel: "Listening Hours",
      focusedPracticeUnit: "focused practice",
      sentencesPracticedLabel: "Sentences Practiced",
      sentencesCompletedUnit: "completed",
      statsPageTitle: "Dictation Statistics",
      period7Days: "Past 7 Days",
      period30Days: "Past 30 Days",
      period3Months: "Past 3 Months",
      periodAllTime: "All Time",
      noLessonsPublished:
        "No listening lessons have been published yet. Check back soon.",
      noLessonsMatchFilters:
        "No lessons match these filters. Try another topic, level or status.",
      couldNotLoadLessons: "Could not load lessons",
      checkConnectionReload: "Check your connection and reload the page.",
      backToLibraryButton: "Back to Library",
    },
    exam: {
      title: "Exam Library",
      subtitle:
        "Standardized mock tests with instant automated grading and diagnostic breakdown.",
      allExams: "All Exams",
      ieltsTab: "IELTS Exams",
      toeicTab: "TOEIC Exams",
      fullTest: "Full Simulation",
      miniTest: "Mini Practice",
      startExam: "Start Exam",
      durationMinutes: "mins",
      totalQuestions: "questions",
      participants: "attempts",
      flagQuestionTip:
        "You can flag questions you are unsure about to review before final submission.",
      mockTestBadge: "Mock Test · Library",
      officialExamsUnit: "Official Exams",
      autoGradingLabel: "Auto Grading",
      aiAnalysisLabel: "AI Analysis",
      searchPlaceholder: "Search by test title or series…",
      clearSearchAria: "Clear search keyword",
      sortByLabel: "Sort by:",
      sortNewest: "Newest",
      sortLevelAsc: "Difficulty: Easy → Hard",
      sortLevelDesc: "Difficulty: Hard → Easy",
      sortScoreDesc: "Highest Score",
      skillAll: "Skill: All",
      diffAll: "Difficulty: All",
      statusAll: "Status: All",
      clearFilters: "Clear Filters",
      clearAllFilters: "Reset All Filters",
      tabAll: "All Exams",
      examsCountUnit: "exams",
      notStarted: "Not Started",
      inProgress: "In Progress",
      completed: "Completed",
      generalSkill: "Comprehensive",
      mockTestFallback: "Mock Test",
      questionsUnit: "questions",
      minutesUnit: "mins",
      bestScoreLabel: "Highest Score",
      maxScoreLabel: "Max Score",
      pointsUnit: "pts",
      retakeAction: "Retake",
      continueAction: "Continue",
      startAction: "Start Exam",
      emptyTitle: "No matching exams found",
      emptySearchDesc:
        'No exams matched your search for "{query}". Try adjusting keywords or clearing filters.',
      emptyFilterDesc:
        "No exams match your current filter criteria. Try clearing some filters to view available tests.",
      backToLibrary: "Exam Library",
      defaultDescription:
        "Standardized mock test simulation to gauge your abilities under realistic timed exam conditions.",
      examTimeLabel: "Test Duration",
      questionQuantityLabel: "Questions",
      questionsUnitFull: "questions",
      maxScoreScaleLabel: "Max Score Scale",
      passScoreLabel: "Pass Score",
      passScoreUnset: "Not set",
      sectionsCountLabel: "Test Sections",
      sectionsUnit: "sections",
      examStructureLabel: "Test Structure:",
      sectionPrefix: "Section",
      sectionIncludes: "Includes {parts} parts · {questions} questions",
      allocatedTimeLabel: "Allocated time:",
      rulesTitle: "Rules & Examination Guidelines:",
      rule1:
        "The countdown timer begins immediately once you click Start Exam.",
      rule2:
        "Use the question palette on the right to track status and navigate directly to any question.",
      rule3:
        "You can flag uncertain questions to review before final submission.",
      rule4:
        "Upon submission, answers are automatically graded with comprehensive explanations.",
      returnToLibrary: "Back to Library",
      exitExam: "Exit",
      progress: "Progress",
      submitExamCTA: "Submit",
      exitConfirm:
        "Are you sure you want to exit? Your current progress will not be saved.",
      listeningSection: "Listening Section",
      audioStimulus: "Audio Track:",
      questionPrefix: "Question",
      flag: "Flag",
      flagged: "Flagged",
      prevQuestion: "Previous",
      nextQuestion: "Next",
      paletteTitle: "Question Palette",
      paletteCompleted: "{answered}/{total} completed",
      legendAnswered: "Answered",
      legendFlagged: "Flagged",
      legendUnanswered: "Unanswered",
      questionAria: "Question {index}",
      confirmModalTitle: "Confirm Exam Submission",
      unansweredWarning: "You still have {count} unanswered questions!",
      allDoneNotice: "You have answered all {count} questions!",
      submitExplanation:
        "Confirming submission will finalize your attempt and display your detailed score report with answer explanations.",
      continueDoing: "Continue Exam",
      confirmSubmitCTA: "Confirm Submit",
      resultTitlePrefix: "Results:",
      finishedBadge: "Exam Completed",
      estimatedScore: "Estimated Score",
      accuracyRate: "Accuracy:",
      correctAnswersCount: "Correct Answers",
      outOfTotal: "Out of {total} questions",
      incorrectAnswersCount: "Incorrect Answers",
      reviewNeeded: "Review explanations",
      timeSpentLabel: "Time Spent",
      skippedCount: "Skipped: {count} questions",
      minutesText: "mins",
      secondsText: "secs",
      explanationsTitle: "Answers & Detailed Explanations",
      explanationsDesc:
        "Review all questions alongside correct answers and reasoning",
      tabAllReview: "All",
      tabCorrect: "Correct",
      tabIncorrect: "Incorrect",
      tabSkipped: "Skipped",
      correctBadge: "Correct Answer",
      yourChoiceBadge: "Your Choice",
      detailedExplanation: "Detailed Explanation:",
      retakeCTA: "Retake Exam",
      notFoundQuestion: "No question data found.",
      failedLoadExam: "Failed to load exam",
      failedLoadExamDesc:
        "The requested exam does not exist or you do not have permission to access it.",
      showingRange: "Showing {start} - {end} of {total} exams",
      loadListError: "Failed to load exam list",
    },
    home: {
      heroBadge: "IELTS · TOEIC practice on a path of your own",
      heroTitle: "Master English",
      heroTitleAccent: "with Englow3",
      heroQuote: "Your unique path, your future in your hands",
      heroDescription:
        "Learn vocabulary by CEFR level, practise dictation, get AI pronunciation scores and sit IELTS/TOEIC mock exams - all in one daily path built for you.",
      heroCta: "Get Started Now",
      heroSecondaryCta: "Explore features",
      heroImageAlt:
        "Englow3 learning platform with pronunciation analytics, flashcard sets, and daily progress tracking",
      highlightsAria: "What Englow3 covers",
      highlights: [
        { value: "A1 → C1", label: "Vocabulary across 5 CEFR levels" },
        { value: "IELTS · TOEIC", label: "Mock exams in the real format" },
        {
          value: "4 skills",
          label: "Listening · Speaking · Reading · Writing",
        },
        { value: "SRS", label: "Review just before you forget" },
      ],
      featuresEyebrow: "Features",
      featuresTitle: "Everything you need to practise English every day",
      featuresSubtitle:
        "Each tool focuses on one skill, and all of them feed a single path.",
      features: [
        {
          title: "AI pronunciation practice",
          description:
            "Record a sentence, get a score down to each IPA sound and see exactly which one to fix.",
        },
        {
          title: "3D flashcards",
          description:
            "Learn vocabulary by level and review with spaced repetition so it sticks.",
        },
        {
          title: "Dictation",
          description:
            "Listen to each sentence, type it and see which words you misheard. Misses are saved for review.",
        },
        {
          title: "IELTS & TOEIC mock exams",
          description:
            "Sit papers in the real format, timed, marked automatically, with every answer to review.",
        },
        {
          title: "AI tutor",
          description:
            "Ask about grammar or vocabulary, or have a sentence corrected - answered on the spot, any time.",
        },
        {
          title: "Daily path",
          description:
            "A manageable list each day: cards due, dictation in progress and quizzes still to pass.",
        },
      ],
      stepsEyebrow: "Getting started",
      stepsTitle: "Three steps to get going",
      steps: [
        {
          title: "Create an account",
          description: "Sign up with your email in under a minute.",
        },
        {
          title: "Set your goal",
          description:
            "Tell us why you are learning, your current level and the skills to focus on.",
        },
        {
          title: "Learn every day",
          description:
            "Follow your daily path, sit mock exams to measure progress and adjust your goal.",
        },
      ],
      ctaTitle: "Ready to start a path of your own?",
      ctaSubtitle: "Setting your goal takes a minute. Englow3 does the rest.",
      footerTagline: "Your unique path, your future in your hands.",
      footerProject: "Graduation project",
    },
    auth: {
      loginTitle: "Welcome Back",
      loginSubtitle: "Your unique path, your future in your hands",
      loginSocial: "Or sign in with",
      noAccountPrompt: "Don't have an account?",
      registerAction: "Sign up now",
      registerTitle: "Create Englow3 Account",
      registerSubtitle: "Join the journey to master English with Englow3",
      registerSocial: "Or sign up with",
      hasAccountPrompt: "Already have an account?",
      loginAction: "Sign In",
      emailLabel: "Email",
      emailPlaceholder: "example@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginSubmit: "Sign In",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "John Doe",
      nicknameLabel: "Nickname",
      nicknameHint: "publicly displayed",
      nicknamePlaceholder: "johndoe",
      passwordRegisterHint: "8+ chars, uppercase, lowercase, special",
      createPasswordPlaceholder: "Create password",
      birthDateLabel: "Date of Birth",
      dayLabel: "Day",
      monthLabel: "Month",
      yearLabel: "Year",
      genderLabel: "Gender",
      termsAgreementPre: "I agree to Englow3's",
      termsOfService: "Terms of Service",
      andWord: "and",
      privacyPolicy: "Privacy Policy",
      termsAgreementPost: ".",
      createAccountSubmit: "Create Account",
      closeAria: "Close",
    },
  },
};
