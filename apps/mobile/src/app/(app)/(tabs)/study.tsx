import { router, type Href } from "expo-router";

import { ListItem, Screen, Section } from "@/ui/components";
import type { IconName } from "@/ui/components";
import { colors } from "@/ui/theme";

type Entry = {
  title: string;
  subtitle: string;
  icon: IconName;
  href: Href;
  color?: string;
};

const PLAN: Entry[] = [
  {
    title: "Lộ trình học",
    subtitle: "Các giai đoạn và mốc của bạn",
    icon: "map-outline",
    href: "/study/roadmap",
  },
  {
    title: "Kiểm tra trình độ",
    subtitle: "Từ vựng, nghe và nói",
    icon: "ribbon-outline",
    href: "/study/level-check",
  },
];

const SKILLS: Entry[] = [
  {
    title: "Thẻ từ vựng",
    subtitle: "Ôn theo lịch lặp lại ngắt quãng",
    icon: "albums-outline",
    href: "/study/flashcards",
  },
  {
    title: "Trắc nghiệm",
    subtitle: "Ngữ pháp và từ vựng",
    icon: "checkbox-outline",
    href: "/study/quiz",
  },
  {
    title: "Nghe chép",
    subtitle: "Nghe câu rồi gõ lại",
    icon: "headset-outline",
    href: "/study/dictation",
  },
  {
    title: "Luyện phát âm",
    subtitle: "AI chấm từng âm",
    icon: "chatbubble-ellipses-outline",
    href: "/study/pronunciation",
  },
  {
    title: "Luyện dịch",
    subtitle: "Việt → Anh, AI nhận xét",
    icon: "language-outline",
    href: "/study/translation",
  },
  {
    title: "Luyện viết",
    subtitle: "Bài viết được chấm theo 4 tiêu chí",
    icon: "create-outline",
    href: "/study/writing",
    color: colors.accent,
  },
  {
    title: "Luyện nói",
    subtitle: "Ghi âm câu trả lời, nhận nhận xét",
    icon: "mic-outline",
    href: "/study/speaking",
    color: colors.accent,
  },
  {
    title: "Bài Nói & Viết đã làm",
    subtitle: "Kết quả và lịch sử",
    icon: "time-outline",
    href: "/study/assessments",
  },
];

const HELP: Entry[] = [
  {
    title: "Gia sư AI",
    subtitle: "Hỏi bài, luyện hội thoại",
    icon: "sparkles-outline",
    href: "/ai-tutor",
    color: colors.success,
  },
];

export default function StudyHubScreen() {
  return (
    <Screen>
      <Section title="Kế hoạch">
        {PLAN.map((entry) => (
          <ListItem
            key={entry.title}
            {...entry}
            onPress={() => router.push(entry.href)}
            iconColor={entry.color}
          />
        ))}
      </Section>
      <Section title="Kỹ năng">
        {SKILLS.map((entry) => (
          <ListItem
            key={entry.title}
            {...entry}
            onPress={() => router.push(entry.href)}
            iconColor={entry.color}
          />
        ))}
      </Section>
      <Section title="Trợ giúp">
        {HELP.map((entry) => (
          <ListItem
            key={entry.title}
            {...entry}
            onPress={() => router.push(entry.href)}
            iconColor={entry.color}
          />
        ))}
      </Section>
    </Screen>
  );
}
