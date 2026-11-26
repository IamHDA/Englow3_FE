import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "@/lib/errors";
import {
  SpeakingAttemptStatus,
  useSpeakingAttemptQuery,
  useStartSpeakingAttemptMutation,
  useSubmitSpeakingAttemptMutation,
} from "@/lib/graphql/generated";
import { uploadToSignedUrl } from "@/lib/upload";
import type { Recording } from "@/ui/audio";

/** Same pacing as the web: a score usually arrives in seconds, never waits more than three minutes. */
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 180_000;

export type SubmissionPhase =
  "idle" | "uploading" | "assessing" | "done" | "error";

/**
 * Pronunciation practice, end to end: ask for an upload ticket, PUT the WAV
 * straight to storage, tell the backend it is there, then poll until the
 * speech service has scored it.
 */
export function useSpeakingSubmission(promptId: string) {
  const [stage, setStage] = useState<
    "idle" | "uploading" | "assessing" | "error"
  >("idle");
  const [stageError, setStageError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [startAttempt] = useStartSpeakingAttemptMutation();
  const [submitAttempt] = useSubmitSpeakingAttemptMutation();

  const polling = stage === "assessing" && attemptId !== null && !timedOut;
  const attempt = useSpeakingAttemptQuery({
    variables: { id: attemptId ?? "" },
    skip: attemptId === null,
    pollInterval: polling ? POLL_INTERVAL_MS : 0,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: false,
  });
  const status = attempt.data?.speakingAttempt.status;

  // Give up waiting after three minutes; the score still lands in the history.
  useEffect(() => {
    if (stage !== "assessing") return;
    const timer = setTimeout(() => setTimedOut(true), POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [stage, attemptId]);

  // The phase follows from where the upload got to and what the poll last saw.
  let phase: SubmissionPhase = stage;
  let error = stageError;
  if (stage === "assessing") {
    if (status === SpeakingAttemptStatus.ASSESSED) phase = "done";
    else if (status === SpeakingAttemptStatus.FAILED) {
      phase = "error";
      error =
        "Chưa chấm được bản ghi này. Hãy nói rõ hơn, gần micro hơn rồi thử lại.";
    } else if (timedOut) {
      phase = "error";
      error =
        "Chấm điểm đang lâu hơn bình thường. Kết quả sẽ xuất hiện trong lịch sử khi xong.";
    }
  }

  const submit = useCallback(
    async (recording: Recording) => {
      setStageError(null);
      setTimedOut(false);
      setStage("uploading");
      try {
        const { data } = await startAttempt({
          variables: {
            promptId,
            contentType: recording.contentType,
            contentLength: recording.bytes.byteLength,
          },
        });
        const ticket = data?.startSpeakingAttempt;
        if (!ticket) throw new Error("No upload ticket");
        await uploadToSignedUrl(
          ticket.uploadUrl,
          ticket.contentType,
          recording.bytes,
        );
        const submitted = await submitAttempt({
          variables: { attemptId: ticket.attemptId },
        });
        if (!submitted.data) throw new Error("No attempt");
        setAttemptId(ticket.attemptId);
        setStage("assessing");
      } catch (failure) {
        setStage("error");
        setStageError(
          failure instanceof Error &&
            failure.message.startsWith("Upload failed")
            ? "Không tải được bản ghi lên. Kiểm tra mạng rồi thử lại."
            : errorMessage(failure),
        );
      }
    },
    [promptId, startAttempt, submitAttempt],
  );

  const reset = useCallback(() => {
    setStage("idle");
    setStageError(null);
    setAttemptId(null);
    setTimedOut(false);
  }, []);

  return {
    phase,
    error,
    submit,
    reset,
    attempt: attempt.data?.speakingAttempt ?? null,
  };
}
