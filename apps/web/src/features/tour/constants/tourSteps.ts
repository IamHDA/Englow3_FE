export type TourStep = {
  target: string;
  placement?: "bottom" | "right";
  titleVi: string;
  titleEn: string;
  bodyVi: string;
  bodyEn: string;
};

export const LEARNER_TOUR: readonly TourStep[] = [
  {
    target: "learner-placement",
    titleVi: "Bài kiểm tra đầu vào",
    titleEn: "Check your starting level",
    bodyVi:
      "Nút này mở bài kiểm tra đầu vào khi có đề được phát hành. Kết quả giúp ghi nhận trình độ của bạn; bạn cũng có thể tự chọn trình độ khi thiết lập mục tiêu.",
    bodyEn:
      "Open a published placement test here to record your level from the result. You can also choose your own level during goal setup.",
  },
  {
    target: "learner-daily-path",
    titleVi: "Theo lộ trình mỗi ngày",
    titleEn: "Follow your daily path",
    bodyVi:
      "Mở lộ trình tại đây để chọn việc học tiếp theo, xem nhiệm vụ hôm nay, XP và chuỗi ngày học.",
    bodyEn:
      "Open your daily path here to choose your next task and see daily goals, XP and your study streak.",
  },
  {
    target: "learner-writing",
    titleVi: "Luyện viết và nhận góp ý",
    titleEn: "Practise writing with feedback",
    bodyVi:
      "Bấm Luyện viết để chọn đề, lưu bài và nộp chấm. Khi có kết quả, xem điểm và góp ý theo từng tiêu chí.",
    bodyEn:
      "Choose Writing to pick a task, save your essay and submit it. Review scores and feedback for each criterion when results are ready.",
  },
  {
    target: "learner-speaking",
    titleVi: "Luyện nói bằng bản ghi âm",
    titleEn: "Practise speaking with recordings",
    bodyVi:
      "Bấm Luyện nói để chọn câu hỏi, ghi âm và nộp bài. Nghe lại bản ghi và xem phản hồi trong lịch sử luyện tập.",
    bodyEn:
      "Choose Speaking to pick a prompt, record and submit your answer. Replay recordings and review feedback in your practice history.",
  },
  {
    target: "learner-flashcards",
    titleVi: "Ôn từ bằng thẻ ghi nhớ",
    titleEn: "Review words with flashcards",
    bodyVi:
      "Mở Thẻ từ để chọn bộ từ, lật thẻ và đánh giá mức ghi nhớ. Kết quả giúp hệ thống sắp lịch ôn lại.",
    bodyEn:
      "Open Flashcards to choose a set, flip cards and rate your recall. Your ratings help schedule future reviews.",
  },
  {
    target: "learner-dictation",
    titleVi: "Luyện nghe chép chính tả",
    titleEn: "Practise listening with dictation",
    bodyVi:
      "Mở Nghe chép, chọn bài, nghe và nhập lại nội dung. Xem đáp án và lỗi sai sau khi nộp.",
    bodyEn:
      "Open Dictation, choose a lesson, listen and type what you hear. Review the transcript and mistakes after submitting.",
  },
  {
    target: "learner-pronunciation",
    titleVi: "Luyện phát âm",
    titleEn: "Practise pronunciation",
    bodyVi:
      "Mở Phát âm để chọn bài luyện và ghi âm. Phân tích phát âm xuất hiện khi dịch vụ chấm giọng nói được bật.",
    bodyEn:
      "Open Pronunciation to choose a lesson and record yourself. Analysis is available when speech assessment is enabled.",
  },
  {
    target: "learner-ai-tutor",
    titleVi: "Hỏi gia sư AI",
    titleEn: "Ask the AI tutor",
    bodyVi:
      "Mở Gia sư AI để hỏi về tiếng Anh, luyện theo tình huống và xem lại lịch sử trao đổi.",
    bodyEn:
      "Open the AI tutor to ask English questions, practise scenarios and revisit your conversations.",
  },
  {
    target: "learner-exams",
    titleVi: "Thi thử và xem kết quả",
    titleEn: "Take mock exams",
    bodyVi:
      "Bấm Thi thử để chọn đề đã xuất bản, xem cấu trúc và bắt đầu làm bài. Kết quả được lưu để xem lại sau khi nộp.",
    bodyEn:
      "Choose Mock exams to select a published paper, review its structure and start. Results are saved after submission.",
  },
  {
    target: "learner-profile",
    titleVi: "Theo dõi hồ sơ và mục tiêu",
    titleEn: "Review your profile and goals",
    bodyVi:
      "Mở Hồ sơ để xem thông tin cá nhân, trình độ và mục tiêu. Bạn có thể mở lại hướng dẫn từ trang chủ hoặc menu tài khoản.",
    bodyEn:
      "Open Profile to review your details, level and goals. Replay this guide from the home page or account menu.",
  },
];

export const STAFF_TOUR: readonly TourStep[] = [
  {
    target: "admin-home",
    placement: "right",
    titleVi: "Xem tổng quan công việc",
    titleEn: "See your work overview",
    bodyVi:
      "Nút Công việc của tôi đưa bạn về tổng quan, nơi theo dõi nội dung đang soạn và việc cần xử lý.",
    bodyEn:
      "My work opens an overview of your drafts and tasks that need attention.",
  },
  {
    target: "admin-assessments",
    placement: "right",
    titleVi: "Soạn và chấm Writing / Speaking",
    titleEn: "Author and assess Writing / Speaking",
    bodyVi:
      "Mở Writing & Speaking tại đây để tạo đề, gửi duyệt và chấm bài nộp của các đề bạn phụ trách.",
    bodyEn:
      "Open Writing & Speaking to create tasks, submit them for review and assess your learners' responses.",
  },
  {
    target: "admin-content",
    placement: "right",
    titleVi: "Soạn nội dung học",
    titleEn: "Author learning content",
    bodyVi:
      "Mở Nội dung học để soạn Flashcard, Quiz, Dictation và bài luyện nói, sau đó gửi bản nháp để admin duyệt.",
    bodyEn:
      "Open Learning content to author lessons and submit drafts for approval.",
  },
  {
    target: "admin-exams",
    placement: "right",
    titleVi: "Soạn đề thi và theo dõi duyệt",
    titleEn: "Author exams and follow reviews",
    bodyVi:
      "Mục Đề thi quản lý đề, câu hỏi và trạng thái duyệt. Chỉnh sửa bản bị trả lại trước khi gửi duyệt tiếp.",
    bodyEn:
      "Exams manages your papers, questions and review status. Revise returned drafts before submitting them again.",
  },
];

export const ADMIN_TOUR: readonly TourStep[] = [
  {
    target: "admin-home",
    placement: "right",
    titleVi: "Theo dõi tổng quan",
    titleEn: "Monitor the overview",
    bodyVi: "Nút Tổng quan mở số liệu hoạt động và các mục đang chờ xử lý.",
    bodyEn: "Overview opens activity metrics and items awaiting attention.",
  },
  {
    target: "admin-assessments",
    placement: "right",
    titleVi: "Duyệt đề và kiểm tra điểm",
    titleEn: "Approve tasks and review grades",
    bodyVi:
      "Mở Writing & Speaking để duyệt đề, theo dõi hàng chờ chấm và kiểm tra hoặc điều chỉnh kết quả.",
    bodyEn:
      "Open Writing & Speaking to review tasks, monitor grading and inspect or correct results.",
  },
  {
    target: "admin-content",
    placement: "right",
    titleVi: "Duyệt nội dung học",
    titleEn: "Review learning content",
    bodyVi:
      "Mở Nội dung học để kiểm tra nội dung nhân viên gửi, phát hành hoặc trả lại kèm lý do.",
    bodyEn:
      "Open Learning content to review staff submissions, publish them or return them with feedback.",
  },
  {
    target: "admin-exams",
    placement: "right",
    titleVi: "Quản lý đề thi",
    titleEn: "Manage exams",
    bodyVi:
      "Mở Đề thi để quản lý cấu trúc, câu hỏi và quy trình phát hành đề, bao gồm đề xếp trình độ đầu vào.",
    bodyEn:
      "Open Exams to manage papers, questions and publishing, including placement tests.",
  },
];
