import { useCallback, useEffect, useRef, useState } from "react";

import { backendCodeOf } from "@/lib/errors";
import {
  ExamAttemptMode,
  useHeartbeatExamAttemptMutation,
  useSaveExamDraftMutation,
} from "@/lib/graphql/generated";

import { toSubmitInput, type ExamAnswers, type Paper } from "./answers";

const AUTOSAVE_MS = 600;
const PRESENCE_INTERVAL_MS = 30_000;

/**
 * Keeps an attempt's answers on the server as the learner works: a save 600 ms
 * after the last change (as on the web), carrying the draft version so another
 * device's newer save is never overwritten. If the server reports the draft
 * changed elsewhere, saving stops and the screen says so.
 */
export function useExamAutosave(
  attemptId: string,
  paper: Paper | undefined,
  initialVersion: number | null,
) {
  const [save] = useSaveExamDraftMutation();
  const version = useRef<number | null>(initialVersion);
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const latest = useRef<ExamAnswers | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialVersion !== null && version.current === null)
      version.current = initialVersion;
  }, [initialVersion]);

  const flush = useCallback(async () => {
    if (!paper || !latest.current || blocked) return;
    const answers = latest.current;
    latest.current = null;
    setSaving(true);
    try {
      const { data } = await save({
        variables: {
          attemptId,
          version: version.current ?? 0,
          answers: toSubmitInput(paper, answers),
        },
      });
      if (data) {
        version.current = data.saveExamDraft.version;
        setLastSavedAt(data.saveExamDraft.savedAt);
      }
    } catch (failure) {
      if (backendCodeOf(failure) === "EXAM_DRAFT_CHANGED") setBlocked(true);
      else latest.current ??= answers; // retried with the next change
    } finally {
      setSaving(false);
    }
  }, [attemptId, paper, save, blocked]);

  const schedule = useCallback(
    (answers: ExamAnswers) => {
      latest.current = answers;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
    },
    [flush],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { schedule, flush, blocked, saving, lastSavedAt };
}

/**
 * A full sitting tells the server every 30 seconds that the learner is still
 * there; one nobody reports on is ended by the backend. `closed` turns true if
 * the server says the sitting is over.
 */
export function useExamPresence(
  attemptId: string,
  mode: ExamAttemptMode | undefined,
  active: boolean,
) {
  const [heartbeat] = useHeartbeatExamAttemptMutation();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (mode !== ExamAttemptMode.FULL || !active) return;
    let stopped = false;
    const beat = async () => {
      try {
        const { data } = await heartbeat({ variables: { attemptId } });
        if (!stopped && data?.heartbeatExamAttempt === false) setClosed(true);
      } catch {
        // A missed beat is retried on the next tick.
      }
    };
    void beat();
    const timer = setInterval(() => void beat(), PRESENCE_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [attemptId, mode, active, heartbeat]);

  return closed;
}
