"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useLanguage } from "@/shared/hooks/useLanguage";

export type ConfirmOptions = {
  title: string;
  /** What will happen, in plain words - not "Are you sure?". */
  body: string;
  /** Names the action ("Lưu trữ", "Xóa phần"), never a bare "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Red, for what removes or hides something. */
  danger?: boolean;
};

/**
 * "Are you sure?" as a Mantine dialog instead of the browser's
 * `window.confirm`, which shows the site's address, cannot be styled and
 * cannot mark a destructive choice. `confirm(...)` resolves true once the
 * action is confirmed and false when it is cancelled or the dialog is closed;
 * the component renders `confirmModal` once.
 *
 *     const { confirm, confirmModal } = useConfirm();
 *     if (!(await confirm({ title, body, confirmLabel, danger: true }))) return;
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmModal: ReactNode;
} {
  const { isVi } = useLanguage();
  const [asked, setAsked] = useState<ConfirmOptions | null>(null);
  const answer = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    // A question still open is answered "no" before the next one replaces it.
    answer.current?.(false);
    setAsked(options);
    return new Promise<boolean>((resolve) => {
      answer.current = resolve;
    });
  }, []);

  const settle = (confirmed: boolean) => {
    answer.current?.(confirmed);
    answer.current = null;
    setAsked(null);
  };

  const confirmModal = (
    <ConfirmModal
      opened={asked !== null}
      title={asked?.title ?? ""}
      body={asked?.body ?? ""}
      confirmLabel={asked?.confirmLabel ?? ""}
      cancelLabel={asked?.cancelLabel ?? (isVi ? "Huỷ" : "Cancel")}
      danger={asked?.danger}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, confirmModal };
}
