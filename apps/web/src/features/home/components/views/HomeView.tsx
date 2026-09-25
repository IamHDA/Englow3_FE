import { Container } from "@mantine/core";

import { HomeCtaBand } from "@/features/home/components/blocks/HomeCtaBand";
import { HomeShowcase } from "@/features/home/components/blocks/HomeShowcase";
import { HomeFooter } from "@/features/home/components/blocks/HomeFooter";
import { HomeHero } from "@/features/home/components/blocks/HomeHero";
import { HomeHighlights } from "@/features/home/components/blocks/HomeHighlights";
import { HomeSteps } from "@/features/home/components/blocks/HomeSteps";
import { HOME_FEATURES_ID } from "@/features/home/constants/homeSections";

import classes from "./HomeView.module.css";

export function HomeView() {
  return (
    <div className={classes.page}>
      <div className={classes.heroBackdrop}>
        <Container size={1280} px={{ base: "md", md: 48 }}>
          <HomeHero />
          <HomeHighlights />
        </Container>
      </div>

      <Container size={1280} px={{ base: "md", md: 48 }}>
        <HomeShowcase id={HOME_FEATURES_ID} />
        <HomeSteps />
        <HomeCtaBand />
        <HomeFooter />
      </Container>
    </div>
  );
}
