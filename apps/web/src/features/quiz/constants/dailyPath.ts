import {
  DailyQuestKind,
  DailyTaskKind,
} from "@/lib/graphql/generated/schemaTypes";

/**
 * Chữ nghĩa của lộ trình. Backend trả về kiểu việc và các con số, không trả câu
 * tiếng Việt - nếu không thì một nửa giao diện sẽ nằm trong service Java và
 * không đổi được theo ngôn ngữ đang chọn.
 *
 * `Record` khoá bằng enum sinh ra: thêm một kiểu việc vào schema là lỗi biên
 * dịch ở đây, chứ không phải một ô trống lúc chạy.
 */
export const TASK_KIND_LABELS: Record<
  DailyTaskKind,
  { vi: string; en: string }
> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: { vi: "Ôn thẻ từ", en: "Review" },
  [DailyTaskKind.DICTATION]: { vi: "Nghe chép", en: "Dictation" },
  [DailyTaskKind.QUIZ]: { vi: "Trắc nghiệm", en: "Quiz" },
};

/** Trang luyện tập tương ứng với từng kiểu việc. */
export const TASK_KIND_HREFS: Record<
  DailyTaskKind,
  (targetId: string) => string
> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: (id) => `/study/flashcards/${id}/study`,
  [DailyTaskKind.DICTATION]: (id) => `/study/dictation/${id}`,
  [DailyTaskKind.QUIZ]: (id) => `/study/quiz/${id}`,
};

/**
 * Đơn vị của `unitsRemaining` - "12 thẻ" chứ không phải "12 đơn vị". Số nhiều
 * tiếng Anh xử lý ngay ở đây vì chỉ có ba trường hợp.
 */
export const TASK_UNIT_LABELS: Record<
  DailyTaskKind,
  { vi: string; en: string; enPlural: string }
> = {
  [DailyTaskKind.FLASHCARD_REVIEW]: {
    vi: "thẻ đến hạn",
    en: "card due",
    enPlural: "cards due",
  },
  [DailyTaskKind.DICTATION]: {
    vi: "câu chưa đạt",
    en: "sentence left",
    enPlural: "sentences left",
  },
  [DailyTaskKind.QUIZ]: {
    vi: "câu hỏi",
    en: "question",
    enPlural: "questions",
  },
};

export const QUEST_LABELS: Record<
  DailyQuestKind,
  { vi: string; en: string; descriptionVi: string; descriptionEn: string }
> = {
  [DailyQuestKind.REVIEW_DUE_CARDS]: {
    vi: "Trả hết thẻ đến hạn hôm nay",
    en: "Clear today's due cards",
    descriptionVi: "Mốc này lớn dần nếu lịch ôn đẩy thêm thẻ tới hạn giữa buổi",
    descriptionEn: "The target grows if the schedule makes more cards due",
  },
  [DailyQuestKind.PASS_A_QUIZ]: {
    vi: "Đạt điểm qua một bài trắc nghiệm",
    en: "Pass one quiz",
    descriptionVi: "Tính theo điểm qua của riêng từng bài",
    descriptionEn: "Measured against each quiz's own pass mark",
  },
  [DailyQuestKind.TYPE_SENTENCES]: {
    vi: "Chép lại câu nghe được",
    en: "Transcribe sentences",
    descriptionVi: "Đúng hay sai đều tính - quan trọng là có gõ",
    descriptionEn: "Right or wrong both count - what matters is doing them",
  },
  [DailyQuestKind.PRACTISE_EVERY_DAY]: {
    vi: "Học đủ bảy ngày gần nhất",
    en: "Study on all of the last seven days",
    descriptionVi: "Mọi hoạt động đều tính, kể cả làm đề thi thử",
    descriptionEn: "Any activity counts, including a mock exam",
  },
};

/**
 * Tên cấp bậc. Cấp là số thật, tính từ điểm kinh nghiệm thật; danh hiệu chỉ là
 * cách gọi cho dễ nhìn. Tra theo cấp sàn nên cấp 20 vẫn có tên chứ không rỗng.
 */
const LEVEL_TITLES: { from: number; vi: string; en: string }[] = [
  { from: 12, vi: "Kỳ cựu", en: "Veteran" },
  { from: 8, vi: "Vững vàng", en: "Steady" },
  { from: 4, vi: "Học giả Tiềm năng", en: "Rising Scholar" },
  { from: 2, vi: "Đang bắt nhịp", en: "Getting Started" },
  { from: 1, vi: "Người mới", en: "Newcomer" },
];

export function levelTitle(level: number, isVi: boolean): string {
  const band = LEVEL_TITLES.find((entry) => level >= entry.from);
  if (!band) return isVi ? "Người mới" : "Newcomer";
  return isVi ? band.vi : band.en;
}
