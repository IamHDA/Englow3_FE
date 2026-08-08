/**
 * Đọc biến môi trường công khai một lần, fail sớm nếu thiếu.
 *
 * Next.js thay thế `process.env.NEXT_PUBLIC_*` ngay lúc build nên phải viết đầy đủ
 * cả chuỗi, không được truy cập động kiểu process.env[key].
 */
function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name}. Copy apps/web/.env.example thành .env.local và điền giá trị.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ),
} as const;
