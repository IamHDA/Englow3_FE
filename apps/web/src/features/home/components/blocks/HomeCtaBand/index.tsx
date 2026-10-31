"use client";

import { Text, Title } from "@mantine/core";

import { HomeCtaButton } from "@/features/home/components/blocks/HomeCtaButton";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeCtaBand.module.css";

export function HomeCtaBand() {
  const { t } = useLanguage();

  return (
    <section className={classes.band}>
      <div className={classes.copy}>
        <Title order={2} className={classes.title}>
          {t.home.ctaTitle}
        </Title>
        <Text className={classes.subtitle}>{t.home.ctaSubtitle}</Text>
      </div>
      <HomeCtaButton
        label={t.home.heroCta}
        color="orange.5"
        size="lg"
        radius="xl"
        className={classes.cta}
      />
    </section>
  );
}
