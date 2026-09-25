"use client";

import { SimpleGrid, Text, ThemeIcon, Title } from "@mantine/core";
import { Bot, Check, Mic, Route, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  DeckListMock,
  DictationMock,
  ExamResultMock,
} from "@/features/home/components/blocks/HomeMocks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeShowcase.module.css";

type HomeShowcaseProps = {
  id: string;
};

/*
 * `t.home.features` in order: pronunciation, flashcards, dictation, exams,
 * tutor, daily path. The three with the most to show get a row each with a
 * picture of the screen; the other three share a line of cards below.
 */
const SHOWCASED: {
  index: number;
  mock: ReactNode;
  points: [string, string][];
}[] = [
  {
    index: 1,
    mock: <DeckListMock />,
    points: [
      ["Từ vựng theo 5 cấp độ CEFR", "Vocabulary across 5 CEFR levels"],
      [
        "Tự lên lịch ôn đúng lúc sắp quên",
        "Reviews scheduled before you forget",
      ],
    ],
  },
  {
    index: 2,
    mock: <DictationMock />,
    points: [
      ["Thấy ngay từ nào nghe sai", "See at once which words you missed"],
      ["Câu sai được gom lại để ôn", "Missed sentences collected for review"],
    ],
  },
  {
    index: 3,
    mock: <ExamResultMock />,
    points: [
      [
        "Đề IELTS và TOEIC đúng định dạng",
        "IELTS and TOEIC in the real format",
      ],
      [
        "Chấm tự động, xem lại từng câu",
        "Marked automatically, every answer reviewed",
      ],
    ],
  },
];

const COMPACT: { index: number; icon: LucideIcon; tone: string }[] = [
  { index: 0, icon: Mic, tone: "orange" },
  { index: 4, icon: Bot, tone: "cyan" },
  { index: 5, icon: Route, tone: "teal" },
];

export function HomeShowcase({ id }: HomeShowcaseProps) {
  const { t, isVi } = useLanguage();
  const features = t.home.features;

  return (
    <section id={id} className={classes.section}>
      <div className={classes.heading}>
        <Text className={classes.eyebrow}>{t.home.featuresEyebrow}</Text>
        <Title order={2} className={classes.title}>
          {t.home.featuresTitle}
        </Title>
      </div>

      <div className={classes.rows}>
        {SHOWCASED.map(({ index, mock, points }, row) => (
          <div
            key={index}
            className={classes.row}
            data-flip={row % 2 === 1 || undefined}
          >
            <div className={classes.copy}>
              <Title order={3} className={classes.rowTitle}>
                {features[index]?.title}
              </Title>
              <Text className={classes.rowText}>
                {features[index]?.description}
              </Text>
              <ul className={classes.points}>
                {points.map(([vi, en]) => (
                  <li key={vi}>
                    <Check size={16} aria-hidden="true" />
                    {isVi ? vi : en}
                  </li>
                ))}
              </ul>
            </div>
            <div className={classes.visual}>{mock}</div>
          </div>
        ))}
      </div>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt={48}>
        {COMPACT.map(({ index, icon: Icon, tone }) => (
          <div key={index} className={classes.compact}>
            <ThemeIcon size={44} radius="md" variant="light" color={tone}>
              <Icon size={22} aria-hidden="true" />
            </ThemeIcon>
            <Title order={4} className={classes.compactTitle}>
              {features[index]?.title}
            </Title>
            <Text size="sm" c="ink.6">
              {features[index]?.description}
            </Text>
          </div>
        ))}
      </SimpleGrid>
    </section>
  );
}
