import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAssessmentSaveDraftMutation } from "@/lib/graphql/generated";

const AUTOSAVE_MS = 2000;
const MAX_LENGTH = 12_000;
const DAY_MS = 86_400_000;

/**
 * An essay being written. Saves to the backend two seconds after the learner
 * stops typing, carrying the version it last saw so two devices cannot
 * overwrite each other silently. A copy also goes to the phone's storage on
 * every change, so a crash or a dead network does not lose the text; it is
 * offered back on the next visit if it differs from what the server has.
 */
export function useWritingDraft(attempt: {
  id: string;
  answerText: string;
  version: number;
}) {
  const [save] = useAssessmentSaveDraftMutation();
  const [text, setText] = useState(attempt.answerText);
  const [saving, setSaving] = useState(false);
  const [savedText, setSavedText] = useState(attempt.answerText);
  const [error, setError] = useState<string | null>(null);
  const [restore, setRestore] = useState<string | null>(null);
  const version = useRef(attempt.version);
  const textRef = useRef(attempt.answerText);
  const saved = useRef(attempt.answerText);
  const pending = useRef<Promise<boolean> | null>(null);
  const storageKey = `englow-writing:${attempt.id}`;

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey).then((raw) => {
      if (!active || !raw) return;
      try {
        const draft = JSON.parse(raw) as { text?: unknown; at?: unknown };
        if (
          typeof draft.text === "string" &&
          typeof draft.at === "number" &&
          Date.now() - draft.at < DAY_MS &&
          draft.text !== attempt.answerText &&
          draft.text.length <= MAX_LENGTH
        ) {
          setRestore(draft.text);
        }
      } catch {
        // A corrupt copy is simply not offered.
      }
    });
    return () => {
      active = false;
    };
  }, [storageKey, attempt.answerText]);

  const flush = useCallback(async (): Promise<boolean> => {
    if (pending.current) return pending.current;
    if (textRef.current === saved.current) return true;
    const snapshot = textRef.current;
    setSaving(true);
    setError(null);
    const operation = (async () => {
      try {
        const { data } = await save({
          variables: {
            id: attempt.id,
            answerText: snapshot,
            version: version.current,
          },
        });
        if (!data) throw new Error("Missing draft result");
        version.current = data.saveAssessmentDraft.version;
        saved.current = snapshot;
        setSavedText(snapshot);
        if (textRef.current === snapshot)
          await AsyncStorage.removeItem(storageKey);
        return true;
      } catch {
        setError(
          "Chưa lưu được bản nháp lên máy chủ. Bản sao vẫn nằm trên điện thoại; Englow3 sẽ thử lại.",
        );
        return false;
      } finally {
        setSaving(false);
        pending.current = null;
      }
    })();
    pending.current = operation;
    return operation;
  }, [attempt.id, save, storageKey]);

  const change = useCallback(
    (value: string) => {
      const next = value.slice(0, MAX_LENGTH);
      textRef.current = next;
      setText(next);
      void AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ text: next, at: Date.now() }),
      );
    },
    [storageKey],
  );

  useEffect(() => {
    if (text === savedText) return;
    const timer = setTimeout(() => void flush(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [text, savedText, flush]);

  const acceptRestore = useCallback(() => {
    if (restore !== null) change(restore);
    setRestore(null);
  }, [restore, change]);

  const dismissRestore = useCallback(() => {
    setRestore(null);
    void AsyncStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    text,
    change,
    flush,
    saving,
    dirty: text !== savedText,
    error,
    restore,
    acceptRestore,
    dismissRestore,
    maxLength: MAX_LENGTH,
  };
}
