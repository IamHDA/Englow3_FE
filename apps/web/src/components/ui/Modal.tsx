'use client';

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

/**
 * Cho biết đã hydrate xong hay chưa: server trả false, client trả true.
 * Dùng useSyncExternalStore thay cho useState + useEffect để không vi phạm
 * quy tắc react-hooks/set-state-in-effect.
 */
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** id của phần tử tiêu đề, dùng cho aria-labelledby. */
  labelledBy?: string;
  /** Cho phép đóng khi bấm ra nền hoặc nhấn Esc. */
  dismissible?: boolean;
  className?: string;
}

/**
 * Popup dùng chung, dựng trên thẻ <dialog> gốc của HTML.
 *
 * Dùng showModal() nên trình duyệt lo sẵn lớp nền, bẫy focus, phím Esc và
 * vô hiệu hoá phần nội dung phía sau — không cần thư viện ngoài.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  labelledBy,
  dismissible = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Portal cần document.body nên chỉ dựng được sau khi hydrate.
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // showModal() không tự khoá cuộn trang phía sau.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Phím Esc phát sự kiện `cancel`; chặn mặc định để React giữ quyền kiểm soát state.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (dismissible) onClose();
    },
    [dismissible, onClose],
  );

  // Nền mờ chính là vùng của <dialog>, nên click trúng dialog nghĩa là click ra ngoài khung.
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (dismissible && event.target === dialogRef.current) onClose();
    },
    [dismissible, onClose],
  );

  if (!mounted) return null;

  // Gắn thẳng vào body: tránh bị ancestor có backdrop-filter / transform / overflow-hidden
  // (ví dụ thanh <header> sticky) làm lệch hoặc cắt mất popup.
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleClick}
      onClose={onClose}
      className={clsx(
        'm-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/20',
        'backdrop:bg-slate-900/30 backdrop:backdrop-blur-[2px]',
        'modal-enter',
        className,
      )}
    >
      {children}
    </dialog>,
    document.body,
  );
};
