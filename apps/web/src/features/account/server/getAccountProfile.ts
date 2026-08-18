import "server-only";

import { query } from "@/lib/apollo/rscClient";
import {
  CurrentUserDocument,
  type CurrentUserQuery,
  type CurrentUserQueryVariables,
} from "@/lib/graphql/generated";

import type { AccountProfileResult } from "../types";

/**
 * Hồ sơ người dùng, lấy từ BFF phía server.
 *
 * Cố ý không tự đọc cookie để biết đã đăng nhập hay chưa: feature `account`
 * không được phụ thuộc ngược lên `auth`. Người gọi (root layout) đã hỏi
 * `getServerSession()` rồi và chỉ gọi hàm này khi có session.
 */
export async function getAccountProfile(): Promise<AccountProfileResult> {
  try {
    const { data } = await query<CurrentUserQuery, CurrentUserQueryVariables>({
      query: CurrentUserDocument,
    });

    return { profile: data?.me ?? null, hasError: false };
  } catch (error) {
    // Hạ cấp xuống "không có hồ sơ" thay vì làm vỡ cả trang. Người dùng vẫn ở
    // trạng thái đã đăng nhập - chỉ riêng phần tên/avatar là không lấy được.
    console.error("Không lấy được hồ sơ người dùng từ BFF", error);
    return { profile: null, hasError: true };
  }
}
