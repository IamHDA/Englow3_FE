import { HomeHero } from "@/features/home/components/blocks/HomeHero";
import { HomeStats } from "@/features/home/components/blocks/HomeStats";
import { homeStats } from "@/features/home/constants/homeStats";

import classes from "./HomeView.module.css";

export function HomeView() {
  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <HomeHero />
        <HomeStats stats={homeStats} />
      </div>
    </div>
  );
}
