/**
 * Lộ trình hằng ngày và nhiệm vụ vẫn là dữ liệu giả - backend chưa có endpoint
 * tiến độ. Danh sách bài kiểm tra đã bị gỡ khỏi đây: nó có thật rồi, lấy qua
 * `quizzes`.
 */
import { DailyPathNode, DailyQuest } from "../types";

export const MOCK_DAILY_PATH_NODES: DailyPathNode[] = [
  {
    id: "node-1",
    title: "Khởi động: Giới từ & Cụm thời gian",
    subtitle: "Nắm vững in / on / at và giới từ chỉ vị trí",
    type: "LESSON",
    status: "COMPLETED",
    order: 1,
    xpReward: 50,
    starsEarned: 3,
  },
  {
    id: "node-2",
    title: "Mini Quiz: Trắc nghiệm giới từ",
    subtitle: "10 câu hỏi kiểm tra phản xạ nhanh",
    type: "QUIZ",
    status: "COMPLETED",
    order: 2,
    xpReward: 80,
    starsEarned: 3,
    targetQuizId: "preposition-mini-quiz",
  },
  {
    id: "node-3",
    title: "Thì Hiện tại hoàn thành vs Quá khứ đơn",
    subtitle: "Phân biệt Since / For và mốc thời gian xác định",
    type: "LESSON",
    status: "COMPLETED",
    order: 3,
    xpReward: 60,
    starsEarned: 2,
  },
  {
    id: "node-4",
    title: "Thử thách: IELTS & Academic Grammar Master",
    subtitle:
      "Chinh phục 5 dạng câu hỏi: Trắc nghiệm, Điền từ, Viết lại câu, Sắp xếp & Nối vế",
    type: "QUIZ",
    status: "CURRENT",
    order: 4,
    xpReward: 120,
    starsEarned: 0,
    targetQuizId: "ielts-academic-grammar",
  },
  {
    id: "node-5",
    title: "Đảo ngữ & Câu điều kiện hỗn hợp",
    subtitle: "Cấu trúc nâng cao ghi điểm Band 7.0+",
    type: "LESSON",
    status: "LOCKED",
    order: 5,
    xpReward: 70,
  },
  {
    id: "node-6",
    title: "Cột mốc: Đánh giá Năng lực Tuần 2",
    subtitle: "Tổng hợp kiến thức toàn diện mở khóa huy hiệu",
    type: "MILESTONE",
    status: "LOCKED",
    order: 6,
    xpReward: 200,
    targetQuizId: "milestone-exam-2",
  },
];

export const MOCK_DAILY_QUESTS: DailyQuest[] = [
  {
    id: "quest-1",
    title: "Vượt qua 1 bài Quiz với điểm ≥ 80%",
    description: "Thử sức với các bài quiz theo chủ đề ngữ pháp",
    progress: 1,
    target: 1,
    rewardXp: 50,
    isCompleted: true,
  },
  {
    id: "quest-2",
    title: "Hoàn thành thử thách Viết lại câu",
    description: "Ghép đúng các thẻ từ mà không dùng từ thừa",
    progress: 0,
    target: 1,
    rewardXp: 40,
    isCompleted: false,
  },
  {
    id: "quest-3",
    title: "Duy trì chuỗi học tập 7 ngày liên tiếp",
    description: "Đăng nhập và hoàn thành ít nhất 1 bài học mỗi ngày",
    progress: 6,
    target: 7,
    rewardXp: 100,
    isCompleted: false,
  },
];
