"use client";

import { readStoredLanguage } from "@/shared/context/LanguageContext";

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
   * Id Supabase của phiên đã tải hồ sơ. Khi server đã lấy hồ sơ, lần mount
   * đầu effect dưới không gọi BFF lần nữa - bỏ so sánh này thì
   * mỗi lần tải trang sẽ gọi `CurrentUser` hai lượt (một server, một client).
   *
   * Khi server gọi BFF hỏng, `profile` là null nên id không trùng session và
   * client thử lại một lần - đúng ý đồ, lỗi tạm thời tự phục hồi.
   */
  const loadedUserId = useRef(
    initialProfile.profile ? (session?.userId ?? null) : null,
  );
  const requestVersion = useRef(0);

  // Dùng chung một nhánh lỗi với effect dưới: gọi lại `loadProfile()` rồi ghi
  // kết quả vào state, không phân biệt "lần đầu" hay "gọi lại theo yêu cầu".
  const refresh = useCallback(async () => {
    if (!session?.userId) return;
    const version = ++requestVersion.current;
    try {
      const { data, error } = await loadProfile();
      if (version !== requestVersion.current) return;
      setFetched({ profile: data?.me ?? null, hasError: Boolean(error) });
    } catch {
      if (version !== requestVersion.current) return;
      setFetched({ profile: null, hasError: true });
    }
  }, [loadProfile, session?.userId]);

  useEffect(() => {
    const userId = session?.userId ?? null;
    let active = true;
    if (userId !== loadedUserId.current) {
      // Đăng xuất được xử lý bởi giá trị context bên dưới.
      if (userId) {
        void Promise.resolve().then(() => {
          if (!active) return;
          loadedUserId.current = userId;
          return refresh();
        });
      } else {
        loadedUserId.current = null;
      }
    }

    return () => {
      // Đổi tài khoản giữa chừng: bỏ kết quả của lượt fetch cũ.
      active = false;
      requestVersion.current += 1;
    };
  }, [session?.userId, refresh]);

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
    // This provider sits above LanguageProvider, so it reads the stored choice.
    const isVi = readStoredLanguage() === "vi";

    notifications.show({
      color: "warn",
      // Not "please sign in again": the session is fine, it is the server
      // that did not answer, and signing in again would not help.
      title: isVi
        ? "Không tải được thông tin tài khoản"
        : "Could not load your account",
      message: isVi
        ? "Máy chủ chưa phản hồi. Tải lại trang sau ít phút."
        : "The server did not answer. Reload the page in a few minutes.",
    });
  }, [value.hasError]);

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}
