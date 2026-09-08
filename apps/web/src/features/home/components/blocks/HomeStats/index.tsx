'use client';

import { Flex, Stack } from "@mantine/core";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { HomeStat } from "@/features/home/constants/homeStats";

import classes from "./HomeStats.module.css";

type HomeStatsProps = {
  stats?: HomeStat[];
};

export function HomeStats({ stats }: HomeStatsProps) {
  const { t } = useLanguage();

  const items = stats && stats.length > 0
    ? [
        { value: stats[0]?.value ?? "150K+", label: t.home.activeLearners, accent: stats[0]?.accent ?? true },
        { value: stats[1]?.value ?? "98.4%", label: t.home.scoreImprovement, accent: stats[1]?.accent ?? false },
        { value: stats[2]?.value ?? "4.9 / 5", label: t.home.userRating, accent: stats[2]?.accent ?? true },
      ]
    : [
        { value: "150K+", label: t.home.activeLearners, accent: true },
        { value: "98.4%", label: t.home.scoreImprovement, accent: false },
        { value: "4.9 / 5", label: t.home.userRating, accent: true },
      ];

  return (
    <section className={classes.stats} aria-label={t.home.statsAria}>
      <hr className={classes.separator} />
      <Flex
        component="dl"
        wrap={{ base: "wrap", md: "nowrap" }}
        gap={{ base: 32, md: 120 }}
        className={classes.list}
      >
        {items.map((stat) => (
          <Stack key={stat.label} gap={2}>
            <dt className={stat.accent ? classes.valueAccent : classes.value}>
              {stat.value}
            </dt>
            <dd className={classes.label}>{stat.label}</dd>
          </Stack>
        ))}
      </Flex>
    </section>
  );
}
