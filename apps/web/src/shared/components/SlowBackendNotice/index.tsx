"use client";

import { notifications } from "@mantine/notifications";
import { useEffect, useSyncExternalStore } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { Button } from "@mantine/core";
import {
  retryServices,
  serviceSnapshot,
  serverServiceSnapshot,
  subscribeServices,
} from "@/shared/network/serviceAvailability";

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
  const services = useSyncExternalStore(
    subscribeServices,
    serviceSnapshot,
    serverServiceSnapshot,
  );
  const waiting =
    pending > 0 ||
    services.backend === "unavailable" ||
    services.ai === "unavailable";

  useEffect(() => {
    if (!waiting) {
      notifications.hide(NOTICE_ID);
      return;
    }

    const timer = setTimeout(() => {
      notifications.show({
        id: NOTICE_ID,
        loading: !services.exhausted,
        autoClose: false,
        withCloseButton: true,
        title: isVi ? "Đang chờ phản hồi…" : "Waiting for a response…",
        message: (
          <div role="status" aria-live="polite">
            {services.exhausted
              ? isVi
                ? "Máy chủ chưa sẵn sàng. Bài đã lưu vẫn được giữ; bạn có thể kiểm tra kết nối lại."
                : "The service is not ready. Saved work is kept; you can check the connection again."
              : services.backend === "ready" && services.ai === "unavailable"
                ? isVi
                  ? "AI đang chưa phản hồi. Bạn vẫn có thể tiếp tục các hoạt động học tập khác."
                  : "AI is not responding. You can continue other learning activities."
                : isVi
                  ? "Phản hồi đang chậm hơn bình thường. Trang sẽ cập nhật khi nhận được dữ liệu; nếu kết nối thất bại, bạn có thể thử lại."
                  : "The response is taking longer than usual. The page will update when data arrives; retry if the connection fails."}
            {services.exhausted && (
              <Button mt="xs" size="sm" variant="light" onClick={retryServices}>
                {isVi ? "Kiểm tra lại" : "Check again"}
              </Button>
            )}
          </div>
        ),
      });
    }, SLOW_AFTER_MS);

    return () => clearTimeout(timer);
  }, [waiting, isVi, services.backend, services.ai, services.exhausted]);

  return null;
}
