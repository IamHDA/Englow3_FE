"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/features/auth/context";
import { useLanguage } from "./useLanguage";

import { FORM_DRAFT_PREFIX } from "@/shared/storage/browserDrafts";
import { matchesDraftShape } from "@/shared/storage/formDraftValidation";
const MAX_AGE = 24 * 60 * 60 * 1000;

/** Browser recovery is separate from saving/publishing on the server. */
export function useRecoverableForm<T>(
  identity: string,
  initial: T,
  validate?: (value: unknown) => boolean,
) {
  const auth = useContext(AuthContext);
  const { isVi } = useLanguage();
  const owner = auth?.session?.userId;
  const key = owner ? `${FORM_DRAFT_PREFIX}${owner}:${identity}` : null;
  const [baseline] = useState(() => JSON.stringify(initial));
  const [value, setValue] = useState(initial);
  const [restored, setRestored] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [readyKey, setReadyKey] = useState<string | null | undefined>(
    undefined,
  );
  const saved = useRef(false);
  const serialized = JSON.stringify(value);
  const dirty = readyKey === key && serialized !== baseline;

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      saved.current = false;
      setValue(JSON.parse(baseline) as T);
      setRestored(false);
      if (key) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const draft = JSON.parse(raw);
            if (
              draft.baseline === baseline &&
              typeof draft.at === "number" &&
              draft.at <= Date.now() &&
              Date.now() - draft.at < MAX_AGE &&
              (validate
                ? validate(draft.value)
                : matchesDraftShape(draft.value, JSON.parse(baseline)))
            ) {
              // Restore after hydration, so server and initial client markup match.
              setValue(draft.value);
              setRestored(true);
            } else localStorage.removeItem(key);
          }
        } catch {
          setStorageError(true);
        }
      }
      setReadyKey(key);
    });
    return () => {
      active = false;
    };
  }, [key, baseline, validate]);

  useEffect(() => {
    if (readyKey !== key || !key || saved.current) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active || saved.current) return;
      try {
        if (dirty)
          localStorage.setItem(
            key,
            JSON.stringify({ baseline, at: Date.now(), value }),
          );
        else localStorage.removeItem(key);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [readyKey, key, dirty, value, baseline]);

  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      if (saved.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const navigation = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? (event.target.closest("a[href]") as HTMLAnchorElement | null)
          : null;
      if (
        !target ||
        target.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        target.href === location.href ||
        saved.current
      )
        return;
      if (
        !window.confirm(
          isVi
            ? "Bạn chưa lưu lên máy chủ. Rời trang và giữ bản nháp trên thiết bị này?"
            : "Changes are not saved to the server. Leave and keep the draft on this device?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigation, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigation, true);
    };
  }, [dirty, isVi]);

  function markSaved() {
    saved.current = true;
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* Do not turn a successful server save into an error. */
      }
    }
  }
  function confirmClose(close: () => void) {
    if (
      !dirty ||
      saved.current ||
      window.confirm(
        isVi
          ? "Đóng cửa sổ? Thay đổi chưa lưu lên máy chủ; bản nháp được giữ trên thiết bị nếu bộ nhớ khả dụng."
          : "Close? Changes are not saved to the server; a draft is kept on this device when storage is available.",
      )
    )
      close();
  }
  return {
    value: readyKey === key ? value : initial,
    setValue,
    dirty,
    restored,
    storageError,
    markSaved,
    confirmClose,
  };
}

export function clearFormDrafts() {
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith(FORM_DRAFT_PREFIX)) localStorage.removeItem(key);
  } catch {
    /* Storage may be disabled. */
  }
}
