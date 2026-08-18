import type { CurrentUserQuery } from "@/lib/graphql/generated";

/**
 * Hồ sơ người dùng lấy từ BFF. Lấy thẳng hình dạng codegen sinh ra thay vì khai
 * báo lại - thêm field vào query là type này tự có, không phải sửa hai nơi.
 */
export type AccountProfile = CurrentUserQuery["me"];

export type AccountProfileResult = {
  profile: AccountProfile | null;
  /**
   * BFF gọi hỏng (backend sập, token hết hạn giữa chừng). Khác hẳn
   * `profile: null` khi chưa đăng nhập - cái này là đang đăng nhập nhưng không
   * lấy được tên, nên UI báo lỗi chứ không đá người dùng về trạng thái khách.
   */
  hasError: boolean;
};
