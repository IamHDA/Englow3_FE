import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioStream,
} from "expo-audio";
import { File, Paths } from "expo-file-system";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { formatDuration } from "@/features/shared/labels";
import {
  concat,
  downsample,
  encodeWav,
  TARGET_SAMPLE_RATE,
  toMono,
  WAV_CONTENT_TYPE,
} from "@/lib/wav";

import { AppText, Button } from "./components";
import { colors, radius, spacing } from "./theme";

/**
 * One player for a screen. `play(url)` swaps the source only when it changed,
 * and restarts from the beginning, which is what "listen again" means.
 */
export function useAudio() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const current = useRef<string | null>(null);

  const play = useCallback(
    async (url: string | null | undefined, rate = 1, startSeconds = 0) => {
      if (!url) return;
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
      if (current.current !== url) {
        player.replace(url);
        current.current = url;
      }
      // Seek before playing, so a sentence cut from a longer clip does not
      // sound its first instant from the start of the file.
      await player.seekTo(startSeconds);
      player.setPlaybackRate(rate);
      player.play();
    },
    [player],
  );

  const pause = useCallback(() => player.pause(), [player]);
  const seekTo = useCallback(
    (seconds: number) => player.seekTo(seconds),
    [player],
  );

  return { player, status, play, pause, seekTo, currentUrl: current };
}

/** A round speaker button for a word or a sentence. */
export function PlayButton({
  url,
  label,
  size = 20,
  onPlay,
}: {
  url: string | null | undefined;
  label?: string;
  size?: number;
  onPlay?: (url: string) => void;
}) {
  const audio = useAudio();
  if (!url) return null;
  const playing = audio.status.playing;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? "Nghe"}
      onPress={() => (onPlay ? onPlay(url) : void audio.play(url))}
      style={({ pressed }) => [styles.play, pressed && { opacity: 0.7 }]}
      hitSlop={8}
    >
      <Ionicons
        name={playing ? "volume-high" : "volume-medium-outline"}
        size={size}
        color={colors.primary}
      />
      {label ? (
        <AppText variant="caption" tone="primary">
          {label}
        </AppText>
      ) : null}
    </Pressable>
  );
}

/** Play/pause with progress for a longer clip (dictation, listening sections). */
export function ClipPlayer({
  url,
  rates = [0.75, 1],
}: {
  url: string;
  rates?: number[];
}) {
  const audio = useAudio();
  const [rate, setRate] = useState(1);
  const { playing, currentTime, duration } = audio.status;

  return (
    <View style={styles.clip}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? "Tạm dừng" : "Phát"}
        onPress={() => (playing ? audio.pause() : void audio.play(url, rate))}
        style={styles.clipButton}
      >
        <Ionicons
          name={playing ? "pause" : "play"}
          size={22}
          color={colors.white}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" tone="muted">
          {formatDuration(currentTime)} / {formatDuration(duration || 0)}
        </AppText>
      </View>
      {rates.map((value) => (
        <Pressable
          key={value}
          onPress={() => {
            setRate(value);
            audio.player.setPlaybackRate(value);
          }}
          style={[styles.rate, rate === value && styles.rateActive]}
        >
          <AppText
            variant="caption"
            tone={rate === value ? "inverse" : "muted"}
          >
            {value}x
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

export type Recording = {
  /** A file in the cache directory, for playing the take back. */
  uri: string;
  /** The WAV file itself, for uploading. */
  bytes: Uint8Array;
  contentType: typeof WAV_CONTENT_TYPE;
  durationSeconds: number;
};

/**
 * Microphone capture as 16 kHz mono WAV, the one format every speech path on
 * the backend accepts. Raw PCM comes from `useAudioStream` on both platforms
 * and is packed into a WAV file here, because Android's file recorder cannot
 * write WAV. `maxSeconds` stops on its own, as the web's recorder does for
 * timed speaking tasks.
 */
export function useRecorder(
  maxSeconds?: number,
  onAutoStop?: (recording: Recording | null) => void,
) {
  const chunks = useRef<Float32Array[]>([]);
  const format = useRef({ sampleRate: TARGET_SAMPLE_RATE, channels: 1 });
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { stream, isStreaming } = useAudioStream({
    sampleRate: TARGET_SAMPLE_RATE,
    channels: 1,
    encoding: "float32",
    onBuffer: (buffer) => {
      format.current = {
        sampleRate: buffer.sampleRate,
        channels: buffer.channels,
      };
      chunks.current.push(new Float32Array(buffer.data.slice(0)));
      setSeconds(Math.floor(buffer.timestamp));
    },
  });

  const start = useCallback(async () => {
    setError(null);
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError("Englow3 cần quyền dùng micro. Hãy bật trong Cài đặt của máy.");
      return false;
    }
    chunks.current = [];
    setSeconds(0);
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    try {
      await stream.start();
      return true;
    } catch {
      setError(
        "Không mở được micro. Đóng ứng dụng khác đang dùng micro rồi thử lại.",
      );
      return false;
    }
  }, [stream]);

  const stop = useCallback(async (): Promise<Recording | null> => {
    stream.stop();
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    });
    const { sampleRate, channels } = format.current;
    const mono = toMono(concat(chunks.current), channels);
    chunks.current = [];
    if (mono.length === 0) return null;
    const samples = downsample(mono, sampleRate);
    const rate = Math.min(sampleRate, TARGET_SAMPLE_RATE);
    const bytes = encodeWav(samples, rate);
    const file = new File(Paths.cache, `recording-${Date.now()}.wav`);
    file.create({ overwrite: true });
    file.write(bytes);
    return {
      uri: file.uri,
      bytes,
      contentType: WAV_CONTENT_TYPE,
      durationSeconds: Math.round(samples.length / rate),
    };
  }, [stream]);

  const stopRef = useRef(stop);
  const autoStopRef = useRef(onAutoStop);
  useEffect(() => {
    stopRef.current = stop;
    autoStopRef.current = onAutoStop;
  });

  useEffect(() => {
    if (maxSeconds && isStreaming && seconds >= maxSeconds) {
      void stopRef
        .current()
        .then((recording) => autoStopRef.current?.(recording));
    }
  }, [maxSeconds, isStreaming, seconds]);

  return { start, stop, isRecording: isStreaming, seconds, error };
}

/** Record / stop / re-record, with the take played back before it is sent. */
export function RecorderPanel({
  maxSeconds,
  recording,
  onRecorded,
  disabled,
}: {
  maxSeconds?: number;
  recording: Recording | null;
  onRecorded: (recording: Recording | null) => void;
  disabled?: boolean;
}) {
  const recorder = useRecorder(maxSeconds, onRecorded);
  const audio = useAudio();

  return (
    <View style={styles.recorder}>
      {recorder.error ? (
        <AppText
          tone="danger"
          variant="caption"
          style={{ marginBottom: spacing.sm }}
        >
          {recorder.error}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          recorder.isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"
        }
        disabled={disabled}
        onPress={async () => {
          if (recorder.isRecording) onRecorded(await recorder.stop());
          else {
            onRecorded(null);
            await recorder.start();
          }
        }}
        style={[
          styles.mic,
          {
            backgroundColor: recorder.isRecording
              ? colors.danger
              : colors.primary,
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        <Ionicons
          name={recorder.isRecording ? "stop" : "mic"}
          size={32}
          color={colors.white}
        />
      </Pressable>
      <AppText tone="muted" style={{ marginTop: spacing.sm }}>
        {recorder.isRecording
          ? `Đang ghi… ${formatDuration(recorder.seconds)}${maxSeconds ? ` / ${formatDuration(maxSeconds)}` : ""}`
          : recording
            ? `Đã ghi ${formatDuration(recording.durationSeconds)}`
            : "Chạm để bắt đầu nói"}
      </AppText>
      {recording && !recorder.isRecording ? (
        <Button
          title="Nghe lại bản ghi"
          variant="ghost"
          size="sm"
          icon="play-circle-outline"
          onPress={() => void audio.play(recording.uri)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  play: { flexDirection: "row", alignItems: "center", gap: 4, padding: 4 },
  clip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  clipButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rate: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  recorder: { alignItems: "center", paddingVertical: spacing.lg },
  mic: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});

/**
 * Plays one sentence cut out of a longer recording: seek to its start, stop at
 * its end. Without a window it plays the whole file. Mirrors the web's
 * useDictationAudio.
 */
export function useSegmentPlayer(
  url: string | null | undefined,
  startMs?: number | null,
  endMs?: number | null,
) {
  const audio = useAudio();
  const [plays, setPlays] = useState(0);
  const window_ = useMemo(
    () =>
      startMs != null && endMs != null && endMs > startMs
        ? { start: startMs / 1000, end: endMs / 1000 }
        : null,
    [startMs, endMs],
  );
  const { currentTime, playing } = audio.status;

  useEffect(() => {
    if (window_ && playing && currentTime >= window_.end) audio.pause();
  }, [window_, playing, currentTime, audio]);

  const play = useCallback(
    async (rate = 1) => {
      if (!url) return;
      await audio.play(url, rate, window_?.start ?? 0);
      setPlays((value) => value + 1);
    },
    [audio, url, window_],
  );

  return { play, pause: audio.pause, playing, plays };
}

export function SegmentPlayer({
  url,
  startMs,
  endMs,
  autoLabel = "Nghe câu",
}: {
  url: string | null | undefined;
  startMs?: number | null;
  endMs?: number | null;
  autoLabel?: string;
}) {
  const segment = useSegmentPlayer(url, startMs, endMs);
  const [rate, setRate] = useState(1);
  if (!url) return null;
  return (
    <View style={styles.clip}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={segment.playing ? "Tạm dừng" : autoLabel}
        onPress={() =>
          segment.playing ? segment.pause() : void segment.play(rate)
        }
        style={styles.clipButton}
      >
        <Ionicons
          name={segment.playing ? "pause" : "play"}
          size={22}
          color={colors.white}
        />
      </Pressable>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{autoLabel}</AppText>
        <AppText variant="caption" tone="muted">
          Đã nghe {segment.plays} lần
        </AppText>
      </View>
      {[0.75, 1].map((value) => (
        <Pressable
          key={value}
          onPress={() => setRate(value)}
          style={[styles.rate, rate === value && styles.rateActive]}
        >
          <AppText
            variant="caption"
            tone={rate === value ? "inverse" : "muted"}
          >
            {value}x
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
