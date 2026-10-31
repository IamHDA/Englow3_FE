/** The bits of a lesson the orders below read. */
export type OrderableLesson = {
  title: string;
  targetLevel?: string | null;
  sentenceCount: number;
  completedSentenceCount: number;
  lastPractisedAt?: string | null;
  publishedAt?: string | null;
};

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Bậc CEFR làm thước độ khó; bài chưa gắn bậc xếp cuối. */
export function levelRank(level: string | null | undefined): number {
  const rank = CEFR_ORDER.indexOf(level ?? "");
  return rank === -1 ? CEFR_ORDER.length : rank;
}

/**
 * Tên theo cách người ta đếm ("Part 2" trước "Part 10") và không phân biệt
 * hoa thường - so sánh chuỗi thô xếp "Test 10" trước "Test 2" và mọi chữ hoa
 * trước chữ thường.
 */
function byTitle(a: OrderableLesson, b: OrderableLesson): number {
  return a.title.localeCompare(b.title, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/** Dễ trước khó, rồi theo tên: thứ tự mặc định của một thư viện chưa có gì khác để dựa vào. */
function byLevelThenTitle(a: OrderableLesson, b: OrderableLesson): number {
  return levelRank(a.targetLevel) - levelRank(b.targetLevel) || byTitle(a, b);
}

function progressOf(lesson: OrderableLesson): number {
  return lesson.sentenceCount > 0
    ? lesson.completedSentenceCount / lesson.sentenceCount
    : 0;
}

/** Mới hơn trước; bài chưa có mốc thời gian xếp sau mọi bài có. */
function newestFirst(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const left = a ? Date.parse(a) : Number.NEGATIVE_INFINITY;
  const right = b ? Date.parse(b) : Number.NEGATIVE_INFINITY;
  if (left === right) return 0;
  return right > left ? 1 : -1;
}

/**
 * Sắp xếp thư viện theo lựa chọn của người học. Mỗi kiểu kết thúc bằng
 * "dễ trước, rồi tên", nên các bài hoà nhau (cùng ngày phát hành, chưa ai
 * luyện) vẫn ra theo một thứ tự đọc được thay vì thứ tự máy chủ trả về.
 */
export function sortLessons<T extends OrderableLesson>(
  lessons: readonly T[],
  sort: string,
): T[] {
  const list = [...lessons];
  switch (sort) {
    case "difficulty":
      return list.sort(
        (a, b) =>
          levelRank(a.targetLevel) - levelRank(b.targetLevel) ||
          a.sentenceCount - b.sentenceCount ||
          byTitle(a, b),
      );
    case "progress":
      return list.sort(
        (a, b) => progressOf(b) - progressOf(a) || byLevelThenTitle(a, b),
      );
    case "newest":
      return list.sort(
        (a, b) =>
          newestFirst(a.publishedAt, b.publishedAt) || byLevelThenTitle(a, b),
      );
    case "recent":
    default:
      return list.sort(
        (a, b) =>
          newestFirst(a.lastPractisedAt, b.lastPractisedAt) ||
          byLevelThenTitle(a, b),
      );
  }
}
