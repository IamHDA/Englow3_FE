import type { Href } from "expo-router";

/**
 * The first-run walkthrough per role, worded as the web's tour
 * (apps/web/src/features/tour/constants/tourSteps.ts). On the phone a step
 * explains a place and can open it, instead of spotlighting a control.
 */
export type TourStep = {
  target: string;
  title: string;
  body: string;
  href: Href | null;
};

export const LEARNER_TOUR: readonly TourStep[] = [
  {
    target: "learner-placement",
    title: "Bài kiểm tra đầu vào",
    body: "Nút này mở bài kiểm tra đầu vào khi có đề được phát hành. Kết quả giúp ghi nhận trình độ của bạn; bạn cũng có thể tự chọn trình độ khi thiết lập mục tiêu.",
    href: "/study/level-check",
  },
  {
    target: "learner-daily-path",
    title: "Theo lộ trình mỗi ngày",
    body: "Mở lộ trình tại đây để chọn việc học tiếp theo, xem nhiệm vụ hôm nay, XP và chuỗi ngày học.",
    href: "/study",
  },
  {
    target: "learner-writing",
    title: "Luyện viết và nhận góp ý",
    body: "Bấm Luyện viết để chọn đề, lưu bài và nộp chấm. Khi có kết quả, xem điểm và góp ý theo từng tiêu chí.",
    href: "/study/writing",
  },
  {
    target: "learner-speaking",
    title: "Luyện nói bằng bản ghi âm",
    body: "Bấm Luyện nói để chọn câu hỏi, ghi âm và nộp bài. Nghe lại bản ghi và xem phản hồi trong lịch sử luyện tập.",
    href: "/study/speaking",
  },
  {
    target: "learner-flashcards",
    title: "Ôn từ bằng thẻ ghi nhớ",
    body: "Mở Thẻ từ để chọn bộ từ, lật thẻ và đánh giá mức ghi nhớ. Kết quả giúp hệ thống sắp lịch ôn lại.",
    href: "/study/flashcards",
  },
  {
    target: "learner-dictation",
    title: "Luyện nghe chép chính tả",
    body: "Mở Nghe chép, chọn bài, nghe và nhập lại nội dung. Xem đáp án và lỗi sai sau khi nộp.",
    href: "/study/dictation",
  },
  {
    target: "learner-pronunciation",
    title: "Luyện phát âm",
    body: "Mở Phát âm để chọn bài luyện và ghi âm. Phân tích phát âm xuất hiện khi dịch vụ chấm giọng nói được bật.",
    href: "/study/pronunciation",
  },
  {
    target: "learner-ai-tutor",
    title: "Hỏi gia sư AI",
    body: "Mở Gia sư AI để hỏi về tiếng Anh, luyện theo tình huống và xem lại lịch sử trao đổi.",
    href: "/ai-tutor",
  },
  {
    target: "learner-exams",
    title: "Thi thử và xem kết quả",
    body: "Bấm Thi thử để chọn đề đã xuất bản, xem cấu trúc và bắt đầu làm bài. Kết quả được lưu để xem lại sau khi nộp.",
    href: "/exams",
  },
  {
    target: "learner-profile",
    title: "Theo dõi hồ sơ và mục tiêu",
    body: "Mở Hồ sơ để xem thông tin cá nhân, trình độ và mục tiêu. Bạn có thể mở lại hướng dẫn từ trang chủ hoặc menu tài khoản.",
    href: "/profile",
  },
];

export const STAFF_TOUR: readonly TourStep[] = [
  {
    target: "admin-home",
    title: "Xem tổng quan công việc",
    body: "Nút Công việc của tôi đưa bạn về tổng quan, nơi theo dõi nội dung đang soạn và việc cần xử lý.",
    href: null,
  },
  {
    target: "admin-assessments",
    title: "Soạn và chấm Writing / Speaking",
    body: "Mở Writing & Speaking tại đây để tạo đề, gửi duyệt và chấm bài nộp của các đề bạn phụ trách.",
    href: "/admin/assessments/tasks",
  },
  {
    target: "admin-content",
    title: "Soạn nội dung học",
    body: "Mở Nội dung học để soạn Flashcard, Quiz, Dictation và bài luyện nói, sau đó gửi bản nháp để admin duyệt.",
    href: "/admin/content",
  },
  {
    target: "admin-exams",
    title: "Soạn đề thi và theo dõi duyệt",
    body: "Mục Đề thi quản lý đề, câu hỏi và trạng thái duyệt. Chỉnh sửa bản bị trả lại trước khi gửi duyệt tiếp.",
    href: "/admin/exams",
  },
];

export const ADMIN_TOUR: readonly TourStep[] = [
  {
    target: "admin-home",
    title: "Theo dõi tổng quan",
    body: "Nút Tổng quan mở số liệu hoạt động và các mục đang chờ xử lý.",
    href: null,
  },
  {
    target: "admin-assessments",
    title: "Duyệt đề và kiểm tra điểm",
    body: "Mở Writing & Speaking để duyệt đề, theo dõi hàng chờ chấm và kiểm tra hoặc điều chỉnh kết quả.",
    href: "/admin/assessments/tasks",
  },
  {
    target: "admin-content",
    title: "Duyệt nội dung học",
    body: "Mở Nội dung học để kiểm tra nội dung nhân viên gửi, phát hành hoặc trả lại kèm lý do.",
    href: "/admin/content",
  },
  {
    target: "admin-exams",
    title: "Quản lý đề thi",
    body: "Mở Đề thi để quản lý cấu trúc, câu hỏi và quy trình phát hành đề, bao gồm đề xếp trình độ đầu vào.",
    href: "/admin/exams",
  },
];
