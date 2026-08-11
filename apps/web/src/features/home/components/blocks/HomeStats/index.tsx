import { Flex, Stack } from "@mantine/core";

import type { HomeStat } from "@/features/home/constants/homeStats";

import classes from "./HomeStats.module.css";

type HomeStatsProps = {
  stats: HomeStat[];
};

export function HomeStats({ stats }: HomeStatsProps) {
  if (stats.length === 0) {
    return null;
  }

  return (
    <section className={classes.stats} aria-label="Englow3 in numbers">
      <hr className={classes.separator} />
      <Flex
        component="dl"
        wrap={{ base: "wrap", md: "nowrap" }}
        gap={{ base: 32, md: 120 }}
        className={classes.list}
      >
        {stats.map((stat) => (
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
