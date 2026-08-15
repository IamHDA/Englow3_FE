import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ hoa")
  .regex(/[a-z]/, "Mật khẩu cần ít nhất 1 chữ thường")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu cần ít nhất 1 ký tự đặc biệt");
