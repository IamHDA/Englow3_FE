"use client";
import { useAssessmentText } from "./useAssessmentText";
import { useApolloClient } from "@apollo/client/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AssessmentSaveDraftDocument } from "@/lib/graphql/generated";
import { useAuth } from "@/features/auth";
import type { PracticeAttempt } from "../types";
export function useWritingDraft(attempt: PracticeAttempt) {
  const tx = useAssessmentText();
  const client = useApolloClient();
  const { session } = useAuth();
  const [text, setText] = useState(attempt.answerText);
  const [saving, setSaving] = useState(false);
  const [savedText, setSavedText] = useState(attempt.answerText);
  const initialText = useRef(attempt.answerText);
  const [error, setError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(0);
  const [restore, setRestore] = useState<string | null>(null);
  const textRef = useRef(attempt.answerText);
  const saved = useRef(attempt.answerText);
  const version = useRef(attempt.version);
  const pending = useRef<Promise<boolean> | null>(null);
  const mounted = useRef(true);
  const storageKey = `englow-writing:${session?.userId ?? "guest"}:${attempt.id}`;
  useEffect(() => {
    mounted.current = true;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (
          typeof draft.text === "string" &&
          typeof draft.at === "number" &&
          draft.at <= Date.now() &&
          Date.now() - draft.at < 86400000 &&
          draft.text !== initialText.current &&
          draft.text.length <= 12000
        )
          void Promise.resolve().then(() => {
            if (mounted.current) setRestore(draft.text);
          });
      }
    } catch {}
    return () => {
      mounted.current = false;
    };
  }, [storageKey]);
  const change = useCallback(
    (value: string) => {
      textRef.current = value;
      setText(value);
      setError(null);
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            text: value,
            version: version.current,
            at: Date.now(),
          }),
        );
      } catch {
        setError(
          tx(
            "Trình duyệt không lưu được bản sao tạm. Hãy bấm Lưu bản nháp trước khi rời trang.",
          ),
        );
      }
    },
    [storageKey, tx],
  );
  const save = useCallback(async (): Promise<boolean> => {
    if (pending.current) return pending.current;
    if (textRef.current === saved.current) return true;
    const snapshot = textRef.current;
    setSaving(true);
    setError(null);
    const operation = (async () => {
      try {
        const r = await client.mutate({
          mutation: AssessmentSaveDraftDocument,
          variables: {
            id: attempt.id,
            answerText: snapshot,
            version: version.current,
          },
        });
        if (!r.data) throw new Error("Missing draft result");
        version.current = r.data.saveAssessmentDraft.version;
        saved.current = snapshot;
        if (mounted.current) {
          setSavedText(snapshot);
          setSavedTick((t) => t + 1);
          try {
            if (textRef.current === snapshot)
              sessionStorage.removeItem(storageKey);
          } catch {}
        }
        return true;
      } catch {
        if (mounted.current)
          setError(
            tx(
              "Chưa lưu được bản nháp. Nội dung vẫn được giữ; hãy thử lại. Nếu mở nhiều tab, tải lại và chọn khôi phục bản sao tạm.",
            ),
          );
        return false;
      } finally {
        pending.current = null;
        if (mounted.current) setSaving(false);
      }
    })();
    pending.current = operation;
    return operation;
  }, [client, attempt.id, storageKey, tx]);
  useEffect(() => {
    if (restore !== null || text === saved.current) return;
    const timer = setTimeout(() => {
      void save();
    }, 1500);
    return () => clearTimeout(timer);
  }, [text, save, savedTick, restore]);
  const flush = useCallback(async () => {
    if (pending.current && !(await pending.current)) return false;
    return save();
  }, [save]);
  return {
    text,
    change,
    saving,
    error,
    save: flush,
    restore,
    restoreLocal: () => {
      if (restore !== null) change(restore);
      setRestore(null);
    },
    discardLocal: () => {
      setRestore(null);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
    },
    dirty: text !== savedText,
  };
}
