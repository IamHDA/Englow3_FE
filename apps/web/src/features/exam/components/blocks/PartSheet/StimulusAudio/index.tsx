"use client";

import React, { useEffect, useRef } from "react";

import { OnceOnlyAudio } from "./OnceOnlyAudio";

export interface StimulusAudioProps {
  src: string;
  /** Stable id of the clip: the signed URL changes on every load. */
  audioId: string;
  label: string;
  /**
   * A real test: each clip is heard once, with no controls. Its attempt id is
   * where what was heard is remembered. Left out, it is practice: an ordinary
   * player.
   */
  onceForAttempt?: string;
  autoPlay: boolean;
  onEnded: () => void;
}

/** The audio of a part or a question set, in a real test or in practice. */
export function StimulusAudio({
  src,
  audioId,
  label,
  onceForAttempt,
  autoPlay,
  onEnded,
}: StimulusAudioProps) {
  if (onceForAttempt) {
    return (
      <OnceOnlyAudio
        key={audioId}
        src={src}
        audioId={audioId}
        attemptId={onceForAttempt}
        label={label}
        autoPlay={autoPlay}
        onEnded={onEnded}
      />
    );
  }
  return (
    <PracticeAudio
      key={audioId}
      src={src}
      label={label}
      autoPlay={autoPlay}
      onEnded={onEnded}
    />
  );
}

/**
 * Practice: the browser's own player, with every control. Asked to start, it
 * starts; a browser that blocks it leaves the player waiting for a click.
 */
function PracticeAudio({
  src,
  label,
  autoPlay,
  onEnded,
}: Pick<StimulusAudioProps, "src" | "label" | "autoPlay" | "onEnded">) {
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (autoPlay) void audio.current?.play().catch(() => undefined);
  }, [autoPlay]);

  return (
    <audio
      ref={audio}
      controls
      preload="none"
      src={src}
      aria-label={label}
      onEnded={onEnded}
      style={{ width: "100%" }}
    />
  );
}
