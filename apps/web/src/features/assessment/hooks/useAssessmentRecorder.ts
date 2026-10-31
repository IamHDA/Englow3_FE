"use client";
import { useAudioRecorder } from "@/shared/audio/useAudioRecorder";

export function useAssessmentRecorder(storageKey?: string) {
  return useAudioRecorder(storageKey);
}
