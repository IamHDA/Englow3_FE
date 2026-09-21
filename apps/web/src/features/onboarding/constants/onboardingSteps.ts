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

/** Dùng chung cho bước thật và skeleton nên chỉ sửa một chỗ khi đổi lời. */
export const LEARNING_PURPOSE_COPY: StepCopy = {
  title: "Mục tiêu học tiếng Anh của bạn là gì?",
  subtitle:
    "Điều này giúp chúng tôi cá nhân hoá lộ trình học hằng ngày cho bạn.",
};

export const CERTIFICATE_TARGET_COPY: StepCopy = {
  title: "Bạn đang nhắm tới chứng chỉ nào?",
  subtitle: "Đề thi thử và lộ trình luyện sẽ bám theo định dạng bạn chọn.",
};

export const CURRENT_LEVEL_COPY: StepCopy = {
  title: "Trình độ tiếng Anh hiện tại của bạn?",
  subtitle: "Chọn mức gần đúng nhất - bạn có thể điều chỉnh lại sau.",
};

export const LEARNING_GOAL_COPY: StepCopy = {
  title: "Mục tiêu cụ thể của bạn là gì?",
  subtitle: "Đặt mốc điểm và hạn hoàn thành để chúng tôi chia nhỏ lộ trình.",
};

export const TARGET_SKILLS_COPY: StepCopy = {
  title: "Bạn muốn tập trung vào kỹ năng nào?",
  subtitle: "Chọn bao nhiêu cũng được, hoặc bỏ qua nếu bạn chưa chắc.",
};

/**
 * Nhãn và mô tả của từng bậc CEFR. Backend nhận đúng sáu giá trị này; mô tả
 * lấy từ thang tự đánh giá của CEFR để người học tự xếp mình mà không cần thi.
 */
export const CEFR_LEVEL_CHOICES: readonly {
  level: CefrLevel;
  label: string;
  description: string;
}[] = [
  {
    level: CefrLevel.A1,
    label: "A1 - Mới bắt đầu",
    description: "Chào hỏi, câu đơn giản",
  },
  {
    level: CefrLevel.A2,
    label: "A2 - Sơ cấp",
    description: "Giao tiếp nhu cầu hằng ngày",
  },
  {
    level: CefrLevel.B1,
    label: "B1 - Trung cấp",
    description: "Xử lý tình huống quen thuộc",
  },
  {
    level: CefrLevel.B2,
    label: "B2 - Trung cao cấp",
    description: "Thảo luận chủ đề trừu tượng",
  },
  {
    level: CefrLevel.C1,
    label: "C1 - Cao cấp",
    description: "Dùng tiếng Anh linh hoạt, học thuật",
  },
  {
    level: CefrLevel.C2,
    label: "C2 - Thành thạo",
    description: "Gần như người bản xứ",
  },
];

export const TARGET_CERTIFICATE_CHOICES: readonly {
  certificate: TargetCertificate;
  label: string;
  description: string;
}[] = [
  {
    certificate: TargetCertificate.IELTS,
    label: "IELTS",
    description: "Thang điểm 0 - 9.0",
  },
  {
    certificate: TargetCertificate.TOEIC,
    label: "TOEIC",
    description: "Thang điểm 10 - 990",
  },
];

export const LEARNING_SKILL_LABELS: Record<LearningSkill, string> = {
  [LearningSkill.LISTENING]: "Nghe",
  [LearningSkill.READING]: "Đọc",
  [LearningSkill.WRITING]: "Viết",
  [LearningSkill.SPEAKING]: "Nói",
  [LearningSkill.GRAMMAR]: "Ngữ pháp",
  [LearningSkill.VOCABULARY]: "Từ vựng",
  [LearningSkill.PRONUNCIATION]: "Phát âm",
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
export const ONBOARDING_ERROR_MESSAGES: Record<string, string> = {
  LEARNING_PURPOSE_NOT_FOUND:
    "Mục đích học vừa chọn không còn tồn tại. Tải lại trang rồi thử lại.",
  CERTIFICATE_TARGET_NOT_APPLICABLE:
    "Bước này chỉ dành cho người học luyện chứng chỉ.",
  PLACEMENT_NOT_AVAILABLE:
    "Bài kiểm tra xếp trình độ chưa mở. Hãy tự chọn một mức cho tới khi có.",
  QUIZ_NOT_AVAILABLE:
    "Bài quiz xếp trình độ chưa mở. Hãy tự chọn một mức cho tới khi có.",
  TARGET_SCORE_NOT_APPLICABLE:
    "Chỉ người học luyện chứng chỉ mới đặt được mốc điểm.",
  ONBOARDING_LEVEL_REQUIRED: "Cần chọn trình độ hiện tại trước đã.",
  ONBOARDING_PURPOSE_REQUIRED: "Cần chọn ít nhất một mục đích học.",
  ONBOARDING_CERTIFICATE_TARGET_REQUIRED:
    "Cần chọn chứng chỉ bạn đang nhắm tới.",
};

export const ONBOARDING_GENERIC_ERROR =
  "Không lưu được lựa chọn. Kiểm tra kết nối rồi thử lại.";

/** Id cố định cho toast "cần onboarding" - bấm nhiều link liền không xếp chồng. */
export const ONBOARDING_REQUIRED_NOTIFICATION_ID = "onboarding-required";
