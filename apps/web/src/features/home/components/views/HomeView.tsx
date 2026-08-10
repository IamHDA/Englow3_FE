import { HomeHero } from "@/features/home/components/blocks/HomeHero";
import { HomeStats } from "@/features/home/components/blocks/HomeStats";
import type { HomeStat } from "@/features/home/types";

import classes from "./HomeView.module.css";

/**
 * Marketing figures shown on the landing page. They are editorial copy rather
 * than live metrics, so they are held here instead of behind a BFF query.
 */
const stats: HomeStat[] = [
  { value: "150K+", label: "Active Learners", accent: true },
  { value: "98.4%", label: "Band Score Gain", accent: false },
  { value: "4.9 / 5", label: "User Rating", accent: true },
];

export function HomeView() {
  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <HomeHero />
        <HomeStats stats={stats} />
      </div>
    </div>
  );
}
