"use client";

import { Container, Stack } from "@mantine/core";
import React from "react";
import {
  MOCK_IPA_CHART,
  MOCK_PRONUNCIATION_LESSONS,
} from "../../../constants/pronunciationData";
import { PronunciationHeader } from "../../blocks/PronunciationHeader";
import { PronunciationLessonGrid } from "../../blocks/PronunciationLessonGrid";
import { PronunciationPhonemeMap } from "../../blocks/PronunciationPhonemeMap";

export function PronunciationLibraryView() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <PronunciationHeader />
        <PronunciationLessonGrid lessons={MOCK_PRONUNCIATION_LESSONS} />
        <PronunciationPhonemeMap sounds={MOCK_IPA_CHART} />
      </Stack>
    </Container>
  );
}
