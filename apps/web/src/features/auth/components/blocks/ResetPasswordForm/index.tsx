"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { supabase } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu cần ít nhất 1 chữ thường")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu cần ít nhất 1 ký tự đặc biệt"),
    // Typed blind, so typed twice: a typo here locks the learner out of an
    // account they just recovered.
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit({ password }: ResetPasswordValues) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể đặt lại mật khẩu",
        message: authErrorMessage(error),
      });
      return;
    }
    notifications.show({
      color: "green",
      title: "Thành công",
      message: "Mật khẩu đã được cập nhật. Bạn đã được đăng nhập.",
    });
    router.replace("/");
    router.refresh();
  }

  return (
    <Flex
      component="form"
      direction="column"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      gap={18}
    >
      <PasswordInput
        {...register("password")}
        autoComplete="new-password"
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        error={errors.password?.message}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )
        }
      />

      <PasswordInput
        {...register("confirmPassword")}
        autoComplete="new-password"
        label="Nhập lại mật khẩu mới"
        placeholder="Nhập lại để chắc chắn"
        error={errors.confirmPassword?.message}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )
        }
      />

      <Button
        type="submit"
        loading={isSubmitting}
        color="orange.5"
        radius={12}
        h={48}
        fz={16}
        fw={700}
      >
        Đặt lại mật khẩu
      </Button>
    </Flex>
  );
}
