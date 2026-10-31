"use client";

import { Text, Title } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "./HomeSteps.module.css";

export function HomeSteps() {
  const { t } = useLanguage();

  return (
    <section className={classes.section}>
      <div className={classes.heading}>
        <Text className={classes.eyebrow}>{t.home.stepsEyebrow}</Text>
        <Title order={2} className={classes.title}>
          {t.home.stepsTitle}
        </Title>
      </div>

      <ol className={classes.list}>
        {t.home.steps.map((step, index) => (
          <li key={step.title} className={classes.step}>
            <span className={classes.number} aria-hidden="true">
              {index + 1}
            </span>
            <Title order={3} className={classes.stepTitle}>
              {step.title}
            </Title>
            <Text className={classes.stepText}>{step.description}</Text>
          </li>
        ))}
      </ol>
    </section>
  );
}
