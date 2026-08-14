import { Container } from "@mantine/core";

import { HomeHero } from "@/features/home/components/blocks/HomeHero";
import { HomeStats } from "@/features/home/components/blocks/HomeStats";
import { homeStats } from "@/features/home/constants/homeStats";

import classes from "./HomeView.module.css";

export function HomeView() {
  return (
    <div className={classes.page}>
      <Container size={1440} px={{ base: "md", md: 60 }}>
        <HomeHero />
        <HomeStats stats={homeStats} />
      </Container>
    </div>
  );
}
