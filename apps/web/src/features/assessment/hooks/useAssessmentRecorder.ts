"use client";
import { useAudioRecorder } from "@/shared/audio/useAudioRecorder";

export function useAssessmentRecorder(storageKey?: string, maxSeconds = 300) {
  return useAudioRecorder(storageKey, maxSeconds);
}
