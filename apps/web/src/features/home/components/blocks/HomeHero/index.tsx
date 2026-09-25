"use client";

import { Badge, Button, Group, Text, Title } from "@mantine/core";
import { Sparkles } from "lucide-react";
import Image from "next/image";

import { HomeCtaButton } from "@/features/home/components/blocks/HomeCtaButton";
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

      <div className={classes.visual}>
        <div className={classes.glow} aria-hidden="true" />
        <Image
          src="/englow3_hero.png"
          alt={t.home.heroImageAlt}
          width={533}
          height={490}
          className={classes.illustration}
          priority
        />
      </div>
    </section>
  );
}
