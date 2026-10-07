"use client";

import { notifications } from "@mantine/notifications";
import { useEffect, useSyncExternalStore } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  pendingRequestCount,
  serverPendingRequestCount,
  subscribePendingRequests,
} from "@/shared/network/pendingRequests";

/** Long enough that an ordinary slow request never trips it. */
const SLOW_AFTER_MS = 6000;
const NOTICE_ID = "slow-backend";

/**
 * Says what is happening when data takes unusually long.
 *
 * The backend runs on a free host that sleeps when nobody has used it for a
 * while, and waking it takes up to a minute. Without this, every screen sat on
 * its skeleton for that minute and looked broken. Mounted once, it watches all
 * requests; no screen has to know.
 */
export function SlowBackendNotice() {
  const { isVi } = useLanguage();
  const pending = useSyncExternalStore(
    subscribePendingRequests,
    pendingRequestCount,
    serverPendingRequestCount,
  );
  const waiting = pending > 0;

  useEffect(() => {
    if (!waiting) {
      notifications.hide(NOTICE_ID);
      return;
    }

    const timer = setTimeout(() => {
      notifications.show({
        id: NOTICE_ID,
        loading: true,
        autoClose: false,
        withCloseButton: true,
        title: isVi ? "Đang chờ phản hồi…" : "Waiting for a response…",
        message: isVi
          ? "Phản hồi đang chậm hơn bình thường. Trang sẽ cập nhật khi nhận được dữ liệu; nếu kết nối thất bại, bạn có thể thử lại."
          : "The response is taking longer than usual. The page will update when data arrives; retry if the connection fails.",
      });
    }, SLOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [waiting, isVi]);

  return null;
}
