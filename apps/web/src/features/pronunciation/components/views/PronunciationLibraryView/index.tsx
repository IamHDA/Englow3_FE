"use client";

import { Alert, Stack } from "@mantine/core";
import React from "react";

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useSpeakingPromptsQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { IPA_CHART } from "../../../constants/pronunciationData";
import { PronunciationHeader } from "../../blocks/PronunciationHeader";
import { PronunciationLessonGrid } from "../../blocks/PronunciationLessonGrid";
import { PronunciationLibrarySkeleton } from "../../blocks/PronunciationLibrarySkeleton";
import { PronunciationPhonemeMap } from "../../blocks/PronunciationPhonemeMap";
import { Page } from "@/shared/components/Page";

/** Một trang câu luyện. Phân trang thật sẽ cần khi thư viện vượt con số này. */
const PROMPT_PAGE_SIZE = 50;

export function PronunciationLibraryView() {
  const { isVi } = useLanguage();
  const { data, loading, error } = useSpeakingPromptsQuery({
    variables: { size: PROMPT_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const prompts = data?.speakingPrompts.items ?? [];

  return (
    <Page>
      <Stack gap="xl">
        <PronunciationHeader />

        {error && prompts.length === 0 ? (
          <Alert
            color="warn"
            title={isVi ? "Không tải được danh sách" : "Could not load prompts"}
          >
            {isVi
              ? "Kiểm tra kết nối tới backend rồi tải lại trang."
              : "Check the connection to the backend and reload."}
          </Alert>
        ) : loading && prompts.length === 0 ? (
          <PronunciationLibrarySkeleton />
        ) : (
          <PronunciationLessonGrid prompts={prompts} />
        )}

        <PronunciationPhonemeMap sounds={IPA_CHART} />
      </Stack>
    </Page>
  );
}
