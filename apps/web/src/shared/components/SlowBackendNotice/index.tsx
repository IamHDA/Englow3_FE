"use client";

import { notifications } from "@mantine/notifications";
import { useEffect, useSyncExternalStore } from "react";

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
        title: "Đang kết nối tới máy chủ…",
        message:
          "Máy chủ đang khởi động lại sau một lúc không dùng, có thể mất tới 1 phút. Trang sẽ tự hiện khi xong.",
      });
    }, SLOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [waiting]);

  return null;
}
