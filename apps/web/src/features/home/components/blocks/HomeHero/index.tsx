import { Text, Title } from "@mantine/core";
import Image from "next/image";

import { StartLearningButton } from "@/features/home/components/blocks/StartLearningButton";

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
          <StartLearningButton />
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
