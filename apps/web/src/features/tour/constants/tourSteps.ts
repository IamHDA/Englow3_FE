export type TourLink = {
  href: string;
  vi: string;
  en: string;
};

export type TourStep = {
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
  links: TourLink[];
};

export const LEARNER_TOUR: readonly TourStep[] = [
  {
    titleVi: "Bắt đầu từ trang chủ",
    titleEn: "Start from your home page",
    bodyVi:
      "Trang chủ chỉ ra việc nên học tiếp, nhiệm vụ hôm nay và các lối tắt tới bài luyện tập.",
    bodyEn:
      "Your home page shows what to study next, today's tasks and shortcuts to practice.",
    links: [{ href: "/", vi: "Trang chủ", en: "Home" }],
  },
  {
    titleVi: "Theo lộ trình mỗi ngày",
    titleEn: "Follow your daily path",
    bodyVi:
      "Lộ trình sắp xếp bài học, ghi nhận XP và số ngày học liên tiếp. Bạn có thể chọn bài phù hợp với mình.",
    bodyEn:
      "Your path organizes tasks, XP and your study streak. Pick a task that suits you.",
    links: [{ href: "/study/daily-path", vi: "Lộ trình", en: "Daily path" }],
  },
  {
    titleVi: "Chọn cách luyện tập",
    titleEn: "Choose how to practise",
    bodyVi:
      "Ôn từ bằng Flashcard, làm Quiz để tự kiểm tra và nghe chép Dictation để luyện tai.",
    bodyEn:
      "Review words with flashcards, check yourself with quizzes and practise listening through dictation.",
    links: [
      { href: "/study/flashcards", vi: "Flashcard", en: "Flashcards" },
      { href: "/study/quiz", vi: "Quiz", en: "Quizzes" },
      { href: "/study/dictation", vi: "Dictation", en: "Dictation" },
    ],
  },
  {
    titleVi: "Luyện cùng công cụ AI",
    titleEn: "Practise with AI tools",
    bodyVi:
      "Gia sư AI hỗ trợ hỏi đáp. Phần luyện nói cho phép ghi âm và xem phân tích phát âm khi dịch vụ chấm giọng nói được bật.",
    bodyEn:
      "Ask the AI tutor questions. Speaking practice lets you record and see pronunciation feedback when speech assessment is enabled.",
    links: [
      { href: "/ai-tutor", vi: "Gia sư AI", en: "AI tutor" },
      { href: "/study/pronunciation", vi: "Luyện nói", en: "Speaking" },
    ],
  },
  {
    titleVi: "Thi thử và xem tiến độ",
    titleEn: "Take exams and track progress",
    bodyVi:
      "Chọn đề thi thử, xem kết quả sau khi nộp bài và mở hồ sơ để theo dõi mục tiêu học tập.",
    bodyEn:
      "Choose a mock exam, review the result after submission and track your goals in your profile.",
    links: [
      { href: "/exams", vi: "Đề thi", en: "Mock exams" },
      { href: "/profile", vi: "Hồ sơ", en: "Profile" },
    ],
  },
];

export const STAFF_TOUR: readonly TourStep[] = [
  {
    titleVi: "Xem tổng quan công việc",
    titleEn: "See your work overview",
    bodyVi: "Trang quản trị cho biết nội dung đang soạn và các mục chờ xử lý.",
    bodyEn:
      "The administration overview shows drafts and items awaiting action.",
    links: [{ href: "/admin", vi: "Tổng quan", en: "Overview" }],
  },
  {
    titleVi: "Soạn nội dung học",
    titleEn: "Author learning content",
    bodyVi:
      "Tạo Flashcard, Quiz, Dictation và bài luyện nói trong mục Nội dung học.",
    bodyEn:
      "Create flashcards, quizzes, dictation and speaking prompts in Learning content.",
    links: [
      { href: "/admin/content", vi: "Nội dung học", en: "Learning content" },
    ],
  },
  {
    titleVi: "Gửi duyệt và theo dõi",
    titleEn: "Submit and follow up",
    bodyVi:
      "Gửi bản nháp để admin duyệt; theo dõi trạng thái và chỉnh sửa khi bị trả lại. Đề thi có danh sách riêng.",
    bodyEn:
      "Submit drafts for admin review, follow their status and revise rejected work. Exams have a separate list.",
    links: [
      { href: "/admin/content", vi: "Nội dung", en: "Content" },
      { href: "/admin/exams", vi: "Đề thi", en: "Exams" },
    ],
  },
];

export const ADMIN_TOUR: readonly TourStep[] = [
  {
    titleVi: "Theo dõi tổng quan",
    titleEn: "Monitor the overview",
    bodyVi:
      "Xem số nội dung chờ duyệt và hoạt động học tập trên trang tổng quan.",
    bodyEn: "See pending reviews and learning activity in the overview.",
    links: [{ href: "/admin", vi: "Tổng quan", en: "Overview" }],
  },
  {
    titleVi: "Duyệt nội dung học",
    titleEn: "Review learning content",
    bodyVi:
      "Mở nội dung nhân viên gửi, kiểm tra rồi duyệt xuất bản hoặc trả lại kèm lý do.",
    bodyEn:
      "Open staff submissions, review them, then publish or reject with a reason.",
    links: [
      { href: "/admin/content", vi: "Nội dung học", en: "Learning content" },
    ],
  },
  {
    titleVi: "Quản lý đề thi",
    titleEn: "Manage exams",
    bodyVi:
      "Quản lý đề thi và quy trình duyệt trong mục Đề thi. Bạn có thể mở lại hướng dẫn từ menu quản trị.",
    bodyEn:
      "Manage exams and their review workflow in Exams. You can replay this tour from the admin menu.",
    links: [{ href: "/admin/exams", vi: "Đề thi", en: "Exams" }],
  },
];
