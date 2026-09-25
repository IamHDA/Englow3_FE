"use client";

import { Badge, Button, Group, Text, Title } from "@mantine/core";
import { Sparkles } from "lucide-react";

import { HomeCtaButton } from "@/features/home/components/blocks/HomeCtaButton";
import {
  FlashcardMock,
  ScoreChip,
  StreakChip,
} from "@/features/home/components/blocks/HomeMocks";
import { HOME_FEATURES_ID } from "@/features/home/constants/homeSections";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeHero.module.css";

export function HomeHero() {
  const { t } = useLanguage();

  return (
    <section className={classes.hero}>
      <div className={classes.copy}>
        <Badge
          size="lg"
          radius="xl"
          variant="light"
          color="orange"
          leftSection={<Sparkles size={14} aria-hidden="true" />}
          classNames={{ root: classes.badge, label: classes.badgeLabel }}
        >
          {t.home.heroBadge}
        </Badge>

        <Title order={1} className={classes.title}>
          {t.home.heroTitle}{" "}
          <span className={classes.titleAccent}>{t.home.heroTitleAccent}</span>
        </Title>

        <Text className={classes.quote}>
          &ldquo;<em>{t.home.heroQuote}</em>&rdquo;
        </Text>

        <Text className={classes.description}>{t.home.heroDescription}</Text>

        <Group gap="md" mt={8}>
          <HomeCtaButton
            label={t.home.heroCta}
            color="orange.5"
            size="lg"
            radius="xl"
            className={classes.cta}
          />
          <Button
            component="a"
            href={`#${HOME_FEATURES_ID}`}
            variant="default"
            size="lg"
            radius="xl"
            className={classes.secondary}
          >
            {t.home.heroSecondaryCta}
          </Button>
        </Group>
      </div>

      {/* The product itself rather than a picture of it: a card being
          studied, with the streak it builds. */}
      <div className={classes.visual}>
        <div className={classes.glow} aria-hidden="true" />
        <div className={classes.previewCard}>
          <FlashcardMock />
        </div>
        <div className={classes.previewChip}>
          <StreakChip />
        </div>
        <div className={classes.previewScore}>
          <ScoreChip />
        </div>
      </div>
    </section>
  );
}
