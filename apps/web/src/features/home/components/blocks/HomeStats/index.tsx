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
      <dl className={classes.list}>
        {stats.map((stat) => (
          <div key={stat.label} className={classes.item}>
            <dt className={stat.accent ? classes.valueAccent : classes.value}>
              {stat.value}
            </dt>
            <dd className={classes.label}>{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
