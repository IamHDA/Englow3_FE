"use client";

import { notifications } from "@mantine/notifications";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useCurrentUserLazyQuery } from "@/lib/graphql/generated/hooks";
import type { OnboardingStateFieldsFragment } from "@/lib/graphql/generated";

import type { AccountProfileResult } from "@/features/account/types";

type AccountContextValue = AccountProfileResult & {
  /** Đang gọi BFF lấy hồ sơ (sau khi đăng nhập, hoặc thử lại sau lỗi). */
  loading: boolean;
  /**
   * Đọc lại hồ sơ từ BFF theo yêu cầu - dùng khi một hành động ở nơi khác (ví
   * dụ đóng popup onboarding) có thể đã đổi `onboardingStep` phía server.
   */
  refresh: () => Promise<void>;
  /**
   * Ghi kết quả của một mutation onboarding vào hồ sơ đang có. Mỗi mutation đã
   * trả về bước kế tiếp, nên không cần gọi lại cả `CurrentUser` (hai lượt tới
   * backend) chỉ để biết đang ở bước nào.
   */
  applyOnboardingState: (state: OnboardingStateFieldsFragment) => void;
};

export const AccountContext = createContext<AccountContextValue | null>(null);

const NO_PROFILE: AccountProfileResult = { profile: null, hasError: false };

type AccountProviderProps = {
  /** Tính sẵn từ server (root layout) nên tên và avatar có ngay trong HTML. */
  initialProfile: AccountProfileResult;
  children: ReactNode;
};

export function AccountProvider({
  initialProfile,
  children,
}: AccountProviderProps) {
  const { session } = useAuth();
  const [fetched, setFetched] = useState(initialProfile);
  const [loadProfile, { loading }] = useCurrentUserLazyQuery({
    fetchPolicy: "network-only",
  });

  /**
   * Id của người mà `fetched` đang mô tả. Server đã lấy hồ sơ rồi nên lần mount
   * đầu id trùng nhau và effect dưới không gọi BFF lần nữa - bỏ so sánh này thì
   * mỗi lần tải trang sẽ gọi `CurrentUser` hai lượt (một server, một client).
   *
   * Khi server gọi BFF hỏng, `profile` là null nên id không trùng session và
   * client thử lại một lần - đúng ý đồ, lỗi tạm thời tự phục hồi.
   */
  const loadedUserId = useRef(initialProfile.profile?.id ?? null);

  // Dùng chung một nhánh lỗi với effect dưới: gọi lại `loadProfile()` rồi ghi
  // kết quả vào state, không phân biệt "lần đầu" hay "gọi lại theo yêu cầu".
  const refresh = useCallback(async () => {
    const { data, error } = await loadProfile();

    if (error) {
      console.error("Không lấy được hồ sơ người dùng từ BFF", error);
      setFetched({ profile: null, hasError: true });
      return;
    }

    setFetched({ profile: data?.me ?? null, hasError: false });
  }, [loadProfile]);

  useEffect(() => {
    const userId = session?.userId ?? null;
    if (userId === loadedUserId.current) return;

    loadedUserId.current = userId;

    // Đăng xuất không cần làm gì ở đây: giá trị hồ sơ được suy ra từ `session`
    // ngay lúc render bên dưới, nên tên người cũ biến mất tức thì.
    if (!userId) return;

    let active = true;

    loadProfile().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Không lấy được hồ sơ người dùng từ BFF", error);
        setFetched({ profile: null, hasError: true });
        return;
      }

      setFetched({ profile: data?.me ?? null, hasError: false });
    });

    return () => {
      // Đổi tài khoản giữa chừng: bỏ kết quả của lượt fetch cũ.
      active = false;
    };
  }, [session?.userId, loadProfile]);

  const applyOnboardingState = useCallback(
    (state: OnboardingStateFieldsFragment) => {
      setFetched((current) =>
        current.profile == null
          ? current
          : {
              ...current,
              profile: {
                ...current.profile,
                onboardingStep: state.step,
                onboardingState: {
                  certificateLearner: state.certificateLearner,
                  currentLevel: state.currentLevel,
                  targetCertificateType: state.targetCertificateType,
                  targetScore: state.targetScore,
                  targetDate: state.targetDate,
                  targetSkills: state.targetSkills,
                },
              },
            },
      );
    },
    [],
  );

  // Chưa đăng nhập thì không có hồ sơ - suy ra chứ không lưu, nên không bao giờ
  // sót lại tên của người vừa đăng xuất.
  const value = useMemo<AccountContextValue>(
    () => ({
      ...(session ? fetched : NO_PROFILE),
      loading,
      refresh,
      applyOnboardingState,
    }),
    [session, fetched, loading, refresh, applyOnboardingState],
  );

  useEffect(() => {
    if (!value.hasError) return;

    notifications.show({
      color: "warn",
      // Not "please sign in again": the session is fine, it is the server
      // that did not answer, and signing in again would not help.
      title: "Không tải được thông tin tài khoản",
      message: "Máy chủ chưa phản hồi. Tải lại trang sau ít phút.",
    });
  }, [value.hasError]);

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}
