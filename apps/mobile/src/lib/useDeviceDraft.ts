import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "englow3:draft:";
const MAX_AGE = 24 * 60 * 60 * 1000;
const WRITE_DELAY_MS = 400;

type Stored<T> = { baseline: string; at: number; value: T };

/**
 * A form's unsaved edits kept on the phone, so an app the system closes in
 * the background does not lose them. As the web's useRecoverableForm: a draft
 * is offered back only for the same owner, the same starting point (an edit
 * on the server since then discards it) and within a day.
 */
export function useDeviceDraft<T>(
  owner: string | null | undefined,
  identity: string,
  initial: T,
  validate: (value: unknown) => boolean,
) {
  const key = owner ? `${PREFIX}${owner}:${identity}` : null;
  const [baseline] = useState(() => JSON.stringify(initial));
  const [value, setValue] = useState(initial);
  const [restored, setRestored] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [ready, setReady] = useState(key === null);
  const saved = useRef(false);
  const validateRef = useRef(validate);
  useEffect(() => {
    validateRef.current = validate;
  });

  const dirty = JSON.stringify(value) !== baseline;

  useEffect(() => {
    if (!key) return;
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const draft = JSON.parse(raw) as Stored<T>;
          if (
            draft.baseline === baseline &&
            typeof draft.at === "number" &&
            draft.at <= Date.now() &&
            Date.now() - draft.at < MAX_AGE &&
            validateRef.current(draft.value)
          ) {
            setValue(draft.value);
            setRestored(true);
          } else void AsyncStorage.removeItem(key);
        }
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setStorageError(true);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key, baseline]);

  useEffect(() => {
    if (!ready || !key || saved.current) return;
    const timer = setTimeout(() => {
      const write = dirty
        ? AsyncStorage.setItem(
            key,
            JSON.stringify({ baseline, at: Date.now(), value }),
          )
        : AsyncStorage.removeItem(key);
      write
        .then(() => setStorageError(false))
        .catch(() => setStorageError(true));
    }, WRITE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, key, dirty, value, baseline]);

  /** The server has the edits now; stop keeping them on the phone. */
  const markSaved = useCallback(() => {
    saved.current = true;
    if (key) void AsyncStorage.removeItem(key);
  }, [key]);

  /** Drops the restored edits and goes back to what the server has. */
  const discard = useCallback(() => {
    setValue(JSON.parse(baseline) as T);
    setRestored(false);
    if (key) void AsyncStorage.removeItem(key);
  }, [key, baseline]);

  return {
    value,
    setValue,
    dirty,
    restored,
    storageError,
    ready,
    markSaved,
    discard,
  };
}
