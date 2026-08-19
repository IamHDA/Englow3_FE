import { Gender } from "@/lib/graphql/generated";

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

export const BIRTH_MONTH_OPTIONS: { value: string; label: string }[] =
  Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1}`,
  }));

export const BIRTH_YEAR_OPTIONS: string[] = Array.from({ length: 60 }, (_, i) =>
  String(2010 - i),
);

/**
 * Chỉ có nhãn tiếng Việt ở đây - danh sách giá trị thuộc về schema BFF, lấy từ
 * enum `Gender` do codegen sinh. BFF thêm hoặc đổi tên một giá trị thì
 * `Record<Gender, string>` báo thiếu nhãn ngay lúc biên dịch; bản chép tay
 * trước đây lệch âm thầm cho tới khi BFF từ chối dữ liệu lúc chạy.
 */
export const GENDER_OPTIONS = [
  { value: Gender.OTHER, label: 'Khác' },
  { value: Gender.MALE, label: 'Nam' },
  { value: Gender.FEMALE, label: 'Nữ' },
];
