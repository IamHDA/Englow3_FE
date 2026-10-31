"use client";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadRecording,
  saveRecording,
  removeRecording,
} from "@/shared/storage/browserDrafts";
import { downsample, encodeWav, TARGET_SAMPLE_RATE } from "./wav";
export function useAudioRecorder(storageKey?: string, maxSeconds = 300) {
  const { isVi } = useLanguage();
  const tx = useCallback(
    (vi: string) => {
      if (isVi) return vi;
      if (vi.startsWith("Thiết bị"))
        return "Recording was interrupted. Check the microphone and record again.";
      if (vi.startsWith("Không mở"))
        return "Could not open the microphone. Check permission and your device, then retry.";
      return `Could not process the recording. Record between 1 and ${maxSeconds} seconds.`;
    },
    [isVi, maxSeconds],
  );
  const [recording, setRecording] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [restored, setRestored] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const clientKey = useRef<string | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const operation = useRef(0);
  const started = useRef(0);
  const chunks = useRef<Blob[]>([]);
  const ownedUrl = useRef<string | null>(null);
  const context = useRef<AudioContext | null>(null);
  const locked = useRef(false);
  useEffect(() => {
    if (!storageKey) return;
    let active = true;
    void loadRecording(storageKey)
      .then((draft) => {
        if (!active || operation.current !== 0 || !draft) return;
        clientKey.current = draft.clientKey;
        ownedUrl.current = URL.createObjectURL(draft.blob);
        setBlob(draft.blob);
        setUrl(ownedUrl.current);
        setSeconds(draft.seconds);
        setRestored(true);
      })
      .catch(() => {
        if (active) setStorageError(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey]);
  const release = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (recorder.current) {
      recorder.current.ondataavailable = null;
      recorder.current.onstop = null;
      if (recorder.current.state !== "inactive") recorder.current.stop();
      recorder.current = null;
    }
    if (context.current) {
      void context.current.close().catch(() => {});
      context.current = null;
    }
  }, []);
  useEffect(
    () => () => {
      operation.current++;
      release();
      if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    },
    [release],
  );
  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") {
      setPreparing(true);
      recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      setRecording(false);
    }
  }, []);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= maxSeconds) stop();
    }, 250);
    return () => clearInterval(timer);
  }, [recording, stop, maxSeconds]);
  const start = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setPreparing(true);
    setError(null);
    const current = ++operation.current;
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error("unsupported");
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (current !== operation.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const capture = new MediaRecorder(media);
      recorder.current = capture;
      chunks.current = [];
      capture.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      capture.onerror = () => {
        release();
        locked.current = false;
        if (current === operation.current) {
          setRecording(false);
          setPreparing(false);
          setError(
            tx("Thiết bị ghi âm bị gián đoạn. Hãy kiểm tra micro rồi ghi lại."),
          );
        }
      };
      capture.onstop = async () => {
        try {
          const ctx = new AudioContext();
          context.current = ctx;
          const decoded = await ctx.decodeAudioData(
            await new Blob(chunks.current, {
              type: capture.mimeType,
            }).arrayBuffer(),
          );
          if (current !== operation.current) return;
          const mono = new Float32Array(decoded.length);
          for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
            const data = decoded.getChannelData(channel);
            for (let i = 0; i < data.length; i++)
              mono[i] += data[i] / decoded.numberOfChannels;
          }
          if (decoded.duration < 1 || decoded.duration > maxSeconds + 1)
            throw new Error("duration");
          const audio = new Blob(
            [
              encodeWav(
                downsample(mono, decoded.sampleRate, TARGET_SAMPLE_RATE),
              ),
            ],
            { type: "audio/wav" },
          );
          if (audio.size > 10485760) throw new Error("size");
          if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
          const next = URL.createObjectURL(audio);
          ownedUrl.current = next;
          setBlob(audio);
          setUrl(next);
          clientKey.current = crypto.randomUUID();
          if (storageKey) {
            try {
              await saveRecording({
                key: storageKey,
                blob: audio,
                clientKey: clientKey.current,
                at: Date.now(),
                seconds: Math.round(decoded.duration),
              });
              setStorageError(false);
            } catch {
              setStorageError(true);
            }
          }
        } catch {
          if (current === operation.current)
            setError(
              tx(
                "Không xử lý được bản ghi. Hãy ghi lại ít nhất 1 giây, tối đa 5 phút.",
              ),
            );
        } finally {
          release();
          locked.current = false;
          if (current === operation.current) setPreparing(false);
        }
      };
      started.current = Date.now();
      setSeconds(0);
      capture.start();
      // Keep the last valid take until its replacement has decoded successfully.
      setRecording(true);
      setPreparing(false);
    } catch {
      release();
      locked.current = false;
      if (current === operation.current) {
        setPreparing(false);
        setError(
          tx(
            "Không mở được micro. Kiểm tra quyền truy cập micro và thiết bị, rồi thử lại.",
          ),
        );
      }
    }
  }, [release, storageKey, tx, maxSeconds]);
  const clear = async () => {
    if (storageKey) {
      try {
        await removeRecording(storageKey);
      } catch {
        /* Submitted evidence is safe on the server. */
      }
    }
  };
  const discard = useCallback(async () => {
    if (locked.current) return false;
    if (storageKey) {
      try {
        await removeRecording(storageKey);
      } catch {
        setStorageError(true);
        return false;
      }
    }
    operation.current++;
    if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current);
    ownedUrl.current = null;
    clientKey.current = null;
    setBlob(null);
    setUrl(null);
    setSeconds(0);
    setRestored(false);
    setError(null);
    return true;
  }, [storageKey]);
  const renewClientKey = useCallback(async () => {
    if (locked.current || !blob) return null;
    const key = crypto.randomUUID();
    clientKey.current = key;
    if (storageKey) {
      try {
        await saveRecording({
          key: storageKey,
          blob,
          clientKey: key,
          at: Date.now(),
          seconds,
        });
      } catch {
        setStorageError(true);
      }
    }
    return key;
  }, [blob, seconds, storageKey]);
  return {
    renewClientKey,
    discard,
    recording,
    preparing,
    blob,
    url,
    error,
    seconds,
    start,
    stop,
    restored,
    storageError,
    clientKey,
    clear,
  };
}
