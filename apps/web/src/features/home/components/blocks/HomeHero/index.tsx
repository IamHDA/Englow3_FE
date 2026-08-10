"use client";

import { Button, Text, Title } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import classes from "./HomeHero.module.css";

export function HomeHero() {
  return (
    <section className={classes.hero}>
      <div className={classes.copy}>
        <Title order={1} className={classes.title}>
          Master English with
          <br />
          Englow3 AI Intelligence
        </Title>

        <p className={classes.quote}>
          &ldquo;<em>Your Personal Path, Your Future in Hand</em>&rdquo;
        </p>

        <Text className={classes.description}>
          Transform your fluency with real-time AI speech pronunciation scoring,
          adaptive daily learning paths, 3D flashcards, dictation challenges, and
          full IELTS/TOEIC mock exam simulations.
        </Text>

        <div className={classes.ctaRow}>
          <Button
            component={Link}
            href="/onboarding"
            variant="gradient"
            gradient={{ from: "amber.5", to: "amber.6", deg: 90 }}
            rightSection={
              <ArrowRight aria-hidden="true" size={26} strokeWidth={2.5} />
            }
            classNames={{ root: classes.cta, label: classes.ctaLabel }}
          >
            Start Learning now
          </Button>
        </div>
      </div>

      <Image
        src="/englow3-hero.png"
        alt="Englow3 learning workspace showing pronunciation analysis, a flashcard deck and a daily progress tracker"
        width={533}
        height={490}
        className={classes.illustration}
        priority
      />
    </section>
  );
}
