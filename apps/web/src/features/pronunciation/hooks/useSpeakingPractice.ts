"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SpeakingAttemptStatus } from "@/lib/graphql/generated/schemaTypes";
import {
  useStartSpeakingAttemptMutation,
  useSubmitSpeakingAttemptMutation,
  useSpeakingAttemptLazyQuery,
} from "@/lib/graphql/generated/hooks";

import {
  concat,
  downsample,
  encodeWav,
  TARGET_SAMPLE_RATE,
  WAV_CONTENT_TYPE,
} from "../audio/wav";
import type { SpeakingAttempt } from "../types";

/** Nhịp hỏi kết quả. Chấm một câu thường mất vài giây, nên hỏi dày hơn là phí. */
const POLL_INTERVAL_MS = 1500;

/**
 * Bỏ cuộc sau chừng này. Backend vẫn thử lại tiếp ở hàng đợi, nên đây chỉ là
 * lúc màn hình ngừng xoay và nói thẳng - không phải lúc công việc bị huỷ.
 */
const POLL_TIMEOUT_MS = 90_000;

export type PracticePhase =
  "idle" | "recording" | "uploading" | "assessing" | "done" | "error";

interface UseSpeakingPracticeOptions {
  promptId: string;
  referenceText: string;
}

/**
 * Cả vòng đời một lần luyện: ghi âm, tải lên, chờ chấm, nhận điểm.
 *
 * Bản ghi đi thẳng từ trình duyệt lên object storage qua URL ký sẵn - không
 * qua BFF, không qua backend. Đẩy vài chục giây tiếng nói qua một request
 * thread thì tốn thread đúng chừng ấy thời gian mà file vẫn nằm ở cùng một chỗ.
 */
export function useSpeakingPractice({
  promptId,
  referenceText,
}: UseSpeakingPracticeOptions) {
  const [phase, setPhase] = useState<PracticePhase>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [attempt, setAttempt] = useState<SpeakingAttempt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [startAttempt] = useStartSpeakingAttemptMutation();
  const [submitAttempt] = useSubmitSpeakingAttemptMutation();
  const [fetchAttempt] = useSpeakingAttemptLazyQuery({
    fetchPolicy: "network-only",
  });

  const releaseMicrophone = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;
    // Mọi track phải dừng, không chỉ đóng AudioContext: bỏ sót thì đèn micro
    // của trình duyệt vẫn sáng sau khi người học đã dừng ghi.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;

    if (durationTimerRef.current !== null) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  useEffect(() => releaseMicrophone, [releaseMicrophone]);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    setAttempt(null);
    setRecordingSeconds(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Ba tuỳ chọn này do trình duyệt xử lý và làm tốt hơn bất cứ thứ gì
        // dựng tay ở đây; tắt đi là gửi cả tiếng ồn phòng cho bộ chấm.
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        // Phải sao chép: trình duyệt dùng lại chính buffer đó cho khối kế tiếp,
        // giữ tham chiếu sẽ ra một bản ghi toàn khối cuối lặp lại.
        chunksRef.current.push(
          new Float32Array(event.inputBuffer.getChannelData(0)),
        );
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      durationTimerRef.current = setInterval(
        () => setRecordingSeconds((seconds) => seconds + 1),
        1000,
      );
      setPhase("recording");
    } catch {
      setPhase("error");
      setErrorMessage(
        "Không truy cập được micro. Kiểm tra quyền truy cập của trình duyệt rồi thử lại.",
      );
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const sampleRate =
      audioContextRef.current?.sampleRate ?? TARGET_SAMPLE_RATE;
    const recorded = chunksRef.current;
    releaseMicrophone();

    const samples = downsample(concat(recorded), sampleRate);
    if (samples.length === 0) {
      setPhase("error");
      setErrorMessage("Không thu được âm thanh nào. Thử ghi lại.");
      return;
    }

    const wav = new Blob([encodeWav(samples)], { type: WAV_CONTENT_TYPE });
    setLocalAudioUrl(URL.createObjectURL(wav));
    setPhase("uploading");

    try {
      const ticket = await startAttempt({
        variables: { promptId, contentType: WAV_CONTENT_TYPE },
      });
      const upload = ticket.data?.startSpeakingAttempt;
      if (upload === undefined) {
        throw new Error("No upload ticket");
      }

      // PUT thẳng lên storage. Không dùng Apollo - đây không phải GraphQL, và
      // URL đã ký sẵn nên không cần gắn token gì thêm.
      const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": upload.contentType },
        body: wav,
      });
      if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}`);
      }

      const submitted = await submitAttempt({
        variables: { attemptId: upload.attemptId },
      });
      setAttempt(submitted.data?.submitSpeakingAttempt ?? null);
      setPhase("assessing");
    } catch {
      setPhase("error");
      setErrorMessage("Không gửi được bản ghi. Kiểm tra kết nối rồi thử lại.");
    }
  }, [promptId, releaseMicrophone, startAttempt, submitAttempt]);

  // Hỏi kết quả chứ không mở socket: một người chờ vài giây cho một điểm số
  // không đáng để giữ một kết nối phải cân tải và nối lại khi rớt.
  useEffect(() => {
    if (phase !== "assessing" || attempt === null) return;

    const attemptId = attempt.id;
    const startedAt = Date.now();

    const timer = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        clearInterval(timer);
        setPhase("error");
        setErrorMessage(
          "Chấm lâu hơn bình thường. Hệ thống vẫn đang xử lý - mở lại trang sau ít phút để xem kết quả.",
        );
        return;
      }

      const polled = await fetchAttempt({ variables: { id: attemptId } });
      const latest = polled.data?.speakingAttempt;
      if (latest === undefined) return;

      if (latest.status === SpeakingAttemptStatus.ASSESSED) {
        clearInterval(timer);
        setAttempt(latest);
        setPhase("done");
      } else if (latest.status === SpeakingAttemptStatus.FAILED) {
        clearInterval(timer);
        setAttempt(latest);
        setPhase("error");
        setErrorMessage("Không chấm được bản ghi này. Thử ghi lại rõ hơn.");
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [phase, attempt, fetchAttempt]);

  const reset = useCallback(() => {
    releaseMicrophone();
    setPhase("idle");
    setAttempt(null);
    setErrorMessage(null);
    setRecordingSeconds(0);
    setLocalAudioUrl(null);
  }, [releaseMicrophone]);

  /** Phát câu mẫu bằng giọng tổng hợp của trình duyệt - không phải bản ghi của ai cả. */
  const playReference = useCallback(
    (slow = false) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window))
        return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(referenceText);
      utterance.lang = "en-US";
      utterance.rate = slow ? 0.75 : 1;
      window.speechSynthesis.speak(utterance);
    },
    [referenceText],
  );

  return {
    phase,
    recordingSeconds,
    attempt,
    errorMessage,
    localAudioUrl,
    startRecording,
    stopRecording,
    reset,
    playReference,
  };
}
