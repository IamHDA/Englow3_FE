"use client";

import { Button, Flex, Text, Title } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import classes from "./HomeHero.module.css";

export function HomeHero() {
  return (
    <Flex
      component="section"
      direction={{ base: "column", md: "row" }}
      align="center"
      justify={{ base: "flex-start", md: "space-between" }}
      gap={{ base: "xl", md: 64 }}
      pt={{ base: 48, md: 92 }}
      pb={{ base: 32, md: 40 }}
    >
      <Flex
        direction="column"
        gap={{ base: 40, md: 72 }}
        flex="1 1 auto"
        miw={0}
        maw={750}
      >
        <Flex direction="column" gap={{ base: 28, md: 42 }}>
          <Title order={1} className={classes.title}>
            Master English with
            <br />
            Englow3 AI Intelligence
          </Title>

          <Text className={classes.quote}>
            &ldquo;<em>Your Personal Path, Your Future in Hand</em>&rdquo;
          </Text>

          <Text className={classes.description}>
            Transform your fluency with real-time AI speech pronunciation
            scoring, adaptive daily learning paths, 3D flashcards, dictation
            challenges, and full IELTS/TOEIC mock exam simulations.
          </Text>
        </Flex>

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
      </Flex>

      <Image
        src="/englow3_hero.png"
        alt="Englow3 learning workspace showing pronunciation analysis, a flashcard deck and a daily progress tracker"
        width={533}
        height={490}
        className={classes.illustration}
        priority
      />
    </Flex>
  );
}
