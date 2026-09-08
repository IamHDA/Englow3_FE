import { Gender } from "@/lib/graphql/generated";
import type { AppTranslations } from "@/shared/constants/translations";

export const AuthMode = {
  LOGIN: "login",
  REGISTER: "register",
} as const;
export type AuthMode = (typeof AuthMode)[keyof typeof AuthMode];

export const AuthProvider = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

type AuthModeCopy = {
  title: string;
  subtitle: string;
  socialLabel: string;
  footerPrompt: string;
  footerAction: string;
};

export function getAuthModeCopy(mode: AuthMode, t: AppTranslations): AuthModeCopy {
  if (mode === AuthMode.REGISTER) {
    return {
      title: t.auth.registerTitle,
      subtitle: t.auth.registerSubtitle,
      socialLabel: t.auth.registerSocial,
      footerPrompt: t.auth.hasAccountPrompt,
      footerAction: t.auth.loginAction,
    };
  }
  return {
    title: t.auth.loginTitle,
    subtitle: t.auth.loginSubtitle,
    socialLabel: t.auth.loginSocial,
    footerPrompt: t.auth.noAccountPrompt,
    footerAction: t.auth.registerAction,
  };
}

export const AUTH_MODE_COPY: Record<AuthMode, AuthModeCopy> = {
  [AuthMode.LOGIN]: {
    title: "Chào mừng trở lại",
    subtitle: "Con đường của riêng bạn, tương lai trong tay bạn",
    socialLabel: "Hoặc đăng nhập bằng",
    footerPrompt: "Chưa có tài khoản?",
    footerAction: "Đăng ký ngay",
  },
  [AuthMode.REGISTER]: {
    title: "Tạo tài khoản Englow3",
    subtitle: "Tham gia vào con đường chinh phục tiếng anh cùng Englow3",
    socialLabel: "Hoặc đăng ký bằng",
    footerPrompt: "Đã có tài khoản?",
    footerAction: "Đăng nhập",
  },
};

export const BIRTH_DAY_OPTIONS: string[] = Array.from({ length: 31 }, (_, i) =>
  String(i + 1),
);

export function getBirthMonthOptions(t: AppTranslations): { value: string; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${t.auth.monthLabel} ${i + 1}`,
  }));
}

export const BIRTH_MONTH_OPTIONS: { value: string; label: string }[] =
  Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1}`,
  }));

export const BIRTH_YEAR_OPTIONS: string[] = Array.from({ length: 60 }, (_, i) =>
  String(2010 - i),
);

export function getGenderOptions(t: AppTranslations) {
  return [
    { value: Gender.OTHER, label: t.account.otherGender },
    { value: Gender.MALE, label: t.account.male },
    { value: Gender.FEMALE, label: t.account.female },
  ];
}

export const GENDER_OPTIONS = [
  { value: Gender.OTHER, label: "Khác" },
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
];
