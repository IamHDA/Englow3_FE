import {
  CefrLevel,
  LearningSkill,
  OnboardingStep,
  TargetCertificate,
} from "@/lib/graphql/generated";

/**
 * Thứ tự hiển thị thật của các bước onboarding. Codegen xếp enum theo chữ cái
 * (`CERTIFICATE_TARGET` trước `LEARNING_PURPOSES`) nên thứ tự khai báo trong
 * enum không mang nghĩa gì - thứ tự đúng chỉ có ở đây, lấy từ thiết kế.
 */
export const ONBOARDING_STEP_ORDER: readonly OnboardingStep[] = [
  OnboardingStep.LEARNING_PURPOSES,
  OnboardingStep.CERTIFICATE_TARGET,
  OnboardingStep.CURRENT_LEVEL,
  OnboardingStep.LEARNING_GOAL,
  OnboardingStep.TARGET_SKILLS,
];

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEP_ORDER.length;

/** Số hiệu 1-based để hiện badge "Bước n / tổng" - không ghi cứng số. */
export function getOnboardingStepNumber(step: OnboardingStep): number {
  return ONBOARDING_STEP_ORDER.indexOf(step) + 1;
}

/**
 * Bước nào đã có giao diện dựng xong. Cả năm bước đều có rồi; `COMPLETED`
 * không phải một bước để hiện nên vẫn là false.
 */
export function hasOnboardingStepUi(step: OnboardingStep): boolean {
  return ONBOARDING_STEP_ORDER.includes(step);
}

type StepCopy = {
  title: string;
  subtitle: string;
};

export type Words = { vi: string; en: string };

/** Each step's heading in both languages; a step picks one with `isVi`. */
type BilingualStepCopy = { vi: StepCopy; en: StepCopy };

/** Dùng chung cho bước thật và skeleton nên chỉ sửa một chỗ khi đổi lời. */
export const LEARNING_PURPOSE_COPY: BilingualStepCopy = {
  vi: {
    title: "Mục tiêu học tiếng Anh của bạn là gì?",
    subtitle:
      "Điều này giúp chúng tôi cá nhân hoá lộ trình học hằng ngày cho bạn.",
  },
  en: {
    title: "What is your goal for learning English?",
    subtitle: "This helps us shape a daily learning path for you.",
  },
};

export const CERTIFICATE_TARGET_COPY: BilingualStepCopy = {
  vi: {
    title: "Bạn đang nhắm tới chứng chỉ nào?",
    subtitle: "Đề thi thử và lộ trình luyện sẽ bám theo định dạng bạn chọn.",
  },
  en: {
    title: "Which certificate are you aiming for?",
    subtitle: "Mock tests and practice follow the format you pick.",
  },
};

export const CURRENT_LEVEL_COPY: BilingualStepCopy = {
  vi: {
    title: "Trình độ tiếng Anh hiện tại của bạn?",
    subtitle: "Chọn mức gần đúng nhất - bạn có thể điều chỉnh lại sau.",
  },
  en: {
    title: "What is your English level right now?",
    subtitle: "Pick the closest level - you can change it later.",
  },
};

export const LEARNING_GOAL_COPY: BilingualStepCopy = {
  vi: {
    title: "Mục tiêu cụ thể của bạn là gì?",
    subtitle: "Đặt mốc điểm và hạn hoàn thành để chúng tôi chia nhỏ lộ trình.",
  },
  en: {
    title: "What exactly is your goal?",
    subtitle:
      "Set a target score and a deadline so we can break the path down.",
  },
};

export const TARGET_SKILLS_COPY: BilingualStepCopy = {
  vi: {
    title: "Bạn muốn tập trung vào kỹ năng nào?",
    subtitle: "Chọn bao nhiêu cũng được, hoặc bỏ qua nếu bạn chưa chắc.",
  },
  en: {
    title: "Which skills do you want to focus on?",
    subtitle: "Pick as many as you like, or skip if you are not sure.",
  },
};

/**
 * Nhãn và mô tả của từng bậc CEFR. Backend nhận đúng sáu giá trị này; mô tả
 * lấy từ thang tự đánh giá của CEFR để người học tự xếp mình mà không cần thi.
 */
export const CEFR_LEVEL_CHOICES: readonly {
  level: CefrLevel;
  label: Words;
  description: Words;
}[] = [
  {
    level: CefrLevel.A1,
    label: { vi: "A1 - Mới bắt đầu", en: "A1 - Beginner" },
    description: {
      vi: "Chào hỏi, câu đơn giản",
      en: "Greetings, simple sentences",
    },
  },
  {
    level: CefrLevel.A2,
    label: { vi: "A2 - Sơ cấp", en: "A2 - Elementary" },
    description: { vi: "Giao tiếp nhu cầu hằng ngày", en: "Everyday needs" },
  },
  {
    level: CefrLevel.B1,
    label: { vi: "B1 - Trung cấp", en: "B1 - Intermediate" },
    description: {
      vi: "Xử lý tình huống quen thuộc",
      en: "Familiar situations",
    },
  },
  {
    level: CefrLevel.B2,
    label: { vi: "B2 - Trung cao cấp", en: "B2 - Upper intermediate" },
    description: { vi: "Thảo luận chủ đề trừu tượng", en: "Abstract topics" },
  },
  {
    level: CefrLevel.C1,
    label: { vi: "C1 - Cao cấp", en: "C1 - Advanced" },
    description: {
      vi: "Dùng tiếng Anh linh hoạt, học thuật",
      en: "Flexible, academic English",
    },
  },
  {
    level: CefrLevel.C2,
    label: { vi: "C2 - Thành thạo", en: "C2 - Proficient" },
    description: {
      vi: "Gần như người bản xứ",
      en: "Close to a native speaker",
    },
  },
];

export const TARGET_CERTIFICATE_CHOICES: readonly {
  certificate: TargetCertificate;
  label: string;
  description: Words;
}[] = [
  {
    certificate: TargetCertificate.IELTS,
    label: "IELTS",
    description: { vi: "Thang điểm 0 - 9.0", en: "Scored 0 - 9.0" },
  },
  {
    certificate: TargetCertificate.TOEIC,
    label: "TOEIC",
    description: { vi: "Thang điểm 10 - 990", en: "Scored 10 - 990" },
  },
];

export const LEARNING_SKILL_LABELS: Record<LearningSkill, Words> = {
  [LearningSkill.LISTENING]: { vi: "Nghe", en: "Listening" },
  [LearningSkill.READING]: { vi: "Đọc", en: "Reading" },
  [LearningSkill.WRITING]: { vi: "Viết", en: "Writing" },
  [LearningSkill.SPEAKING]: { vi: "Nói", en: "Speaking" },
  [LearningSkill.GRAMMAR]: { vi: "Ngữ pháp", en: "Grammar" },
  [LearningSkill.VOCABULARY]: { vi: "Từ vựng", en: "Vocabulary" },
  [LearningSkill.PRONUNCIATION]: { vi: "Phát âm", en: "Pronunciation" },
};

/** Thang điểm hợp lệ của từng chứng chỉ, để form mục tiêu tự kiểm trước khi gửi. */
export const CERTIFICATE_SCORE_RANGE: Record<
  TargetCertificate,
  { min: number; max: number; step: number }
> = {
  [TargetCertificate.IELTS]: { min: 1, max: 9, step: 0.5 },
  [TargetCertificate.TOEIC]: { min: 10, max: 990, step: 5 },
};

/**
 * `extensions.backendCode` của BFF là mã miền ổn định, không phải chữ tự do -
 * dịch sang lời người đọc được ở đây thay vì hiện thẳng thông báo của server.
 */
export const ONBOARDING_ERROR_MESSAGES: Record<string, Words> = {
  LEARNING_PURPOSE_NOT_FOUND: {
    vi: "Mục đích học vừa chọn không còn tồn tại. Tải lại trang rồi thử lại.",
    en: "That learning goal no longer exists. Reload the page and try again.",
  },
  CERTIFICATE_TARGET_NOT_APPLICABLE: {
    vi: "Bước này chỉ dành cho người học luyện chứng chỉ.",
    en: "This step is only for learners preparing for a certificate.",
  },
  PLACEMENT_NOT_AVAILABLE: {
    vi: "Bài kiểm tra xếp trình độ chưa mở. Hãy tự chọn một mức cho tới khi có.",
    en: "The placement test is not open yet. Pick a level yourself until it is.",
  },
  QUIZ_NOT_AVAILABLE: {
    vi: "Bài quiz xếp trình độ chưa mở. Hãy tự chọn một mức cho tới khi có.",
    en: "The placement quiz is not open yet. Pick a level yourself until it is.",
  },
  TARGET_SCORE_NOT_APPLICABLE: {
    vi: "Chỉ người học luyện chứng chỉ mới đặt được mốc điểm.",
    en: "Only learners preparing for a certificate can set a target score.",
  },
  TARGET_SCORE_OUT_OF_RANGE: {
    vi: "Điểm mục tiêu không đúng thang điểm: IELTS từ 0 đến 9 (bước 0.5), TOEIC từ 10 đến 990 (bước 5).",
    en: "The target score is off the scale: IELTS 0 to 9 (steps of 0.5), TOEIC 10 to 990 (steps of 5).",
  },
  CURRENT_SCORE_OUT_OF_RANGE: {
    vi: "Điểm hiện tại không đúng thang điểm: IELTS từ 0 đến 9 (bước 0.5), TOEIC từ 10 đến 990 (bước 5).",
    en: "The current score is off the scale: IELTS 0 to 9 (steps of 0.5), TOEIC 10 to 990 (steps of 5).",
  },
  ONBOARDING_LEVEL_REQUIRED: {
    vi: "Cần chọn trình độ hiện tại trước đã.",
    en: "Pick your current level first.",
  },
  ONBOARDING_PURPOSE_REQUIRED: {
    vi: "Cần chọn ít nhất một mục đích học.",
    en: "Pick at least one learning goal.",
  },
  ONBOARDING_CERTIFICATE_TARGET_REQUIRED: {
    vi: "Cần chọn chứng chỉ bạn đang nhắm tới.",
    en: "Pick the certificate you are aiming for.",
  },
  PLACEMENT_EXAM_NOT_FOUND: {
    vi: "Chưa có đề kiểm tra đầu vào nào được phát hành. Hãy tự chọn một mức bên dưới.",
    en: "No placement test has been published yet. Pick a level below yourself.",
  },
};

export const ONBOARDING_GENERIC_ERROR: Words = {
  vi: "Không lưu được lựa chọn. Kiểm tra kết nối rồi thử lại.",
  en: "Could not save your choice. Check the connection and try again.",
};

/** Id cố định cho toast "cần onboarding" - bấm nhiều link liền không xếp chồng. */
export const ONBOARDING_REQUIRED_NOTIFICATION_ID = "onboarding-required";
