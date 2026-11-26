import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { Button, ErrorState, LoadingState, Screen } from "@/ui/components";

/**
 * Where e-mail confirmation and OAuth links land. The auth provider already
 * exchanges the code from the incoming URL; this screen only waits for the
 * root navigator to switch to the signed-in screens, and explains a link that
 * failed.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ error_code?: string }>();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (params.error_code || timedOut) {
    return (
      <Screen scroll={false} edges={["top", "bottom"]}>
        <ErrorState
          message={
            params.error_code
              ? authErrorMessage({ code: params.error_code })
              : "Link không còn hợp lệ hoặc đã được dùng. Hãy đăng nhập lại."
          }
        />
        <Button title="Về đăng nhập" onPress={() => router.replace("/login")} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} edges={["top", "bottom"]}>
      <LoadingState label="Đang xác nhận tài khoản…" />
    </Screen>
  );
}
