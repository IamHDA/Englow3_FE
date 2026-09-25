"use client";

import { SimpleGrid, Text, Title } from "@mantine/core";
import {
  Bot,
  ClipboardCheck,
  Headphones,
  Layers,
  Mic,
  Route,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeFeatures.module.css";

/** Paired by position with `t.home.features`. */
const FEATURE_ICONS: { icon: LucideIcon; tone: "navy" | "orange" | "teal" }[] =
  [
    { icon: Mic, tone: "orange" },
    { icon: Layers, tone: "navy" },
    { icon: Headphones, tone: "teal" },
    { icon: ClipboardCheck, tone: "navy" },
    { icon: Bot, tone: "orange" },
    { icon: Route, tone: "teal" },
  ];

type HomeFeaturesProps = {
  id: string;
};

export function HomeFeatures({ id }: HomeFeaturesProps) {
  const { t } = useLanguage();

  return (
    <section id={id} className={classes.section}>
      <div className={classes.heading}>
        <Text className={classes.eyebrow}>{t.home.featuresEyebrow}</Text>
        <Title order={2} className={classes.title}>
          {t.home.featuresTitle}
        </Title>
        <Text className={classes.subtitle}>{t.home.featuresSubtitle}</Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {t.home.features.map((feature, index) => {
          const { icon: Icon, tone } = FEATURE_ICONS[index] ?? {
            icon: Layers,
            tone: "navy",
          };
          return (
            <article key={feature.title} className={classes.card}>
              <span className={classes.iconTile} data-tone={tone}>
                <Icon size={24} aria-hidden="true" />
              </span>
              <Title order={3} className={classes.cardTitle}>
                {feature.title}
              </Title>
              <Text className={classes.cardText}>{feature.description}</Text>
            </article>
          );
        })}
      </SimpleGrid>
    </section>
  );
}
