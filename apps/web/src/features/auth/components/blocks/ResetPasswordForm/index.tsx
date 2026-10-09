"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { setNewPassword } from "@/features/auth/api/authClient";
import { announceSessionChange } from "@/features/auth/api/sessionSync";
import { useLanguage } from "@/shared/hooks/useLanguage";

function resetPasswordSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z
    .object({
      password: z
        .string()
        .min(8, tr("Mật khẩu tối thiểu 8 ký tự", "At least 8 characters"))
        .regex(
          /[A-Z]/,
          tr(
            "Mật khẩu cần ít nhất 1 chữ hoa",
            "Needs at least 1 uppercase letter",
          ),
        )
        .regex(
          /[a-z]/,
          tr(
            "Mật khẩu cần ít nhất 1 chữ thường",
            "Needs at least 1 lowercase letter",
          ),
        )
        .regex(
          /[^A-Za-z0-9]/,
          tr(
            "Mật khẩu cần ít nhất 1 ký tự đặc biệt",
            "Needs at least 1 special character",
          ),
        ),
      // Typed blind, so typed twice: a typo here locks the learner out of an
      // account they just recovered.
      confirmPassword: z
        .string()
        .min(1, tr("Vui lòng nhập lại mật khẩu", "Enter the password again")),
    })
    .refine((values) => values.password === values.confirmPassword, {
      path: ["confirmPassword"],
      message: tr("Mật khẩu nhập lại không khớp", "The passwords do not match"),
    });
}

type ResetPasswordValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

export function ResetPasswordForm() {
  const router = useRouter();
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const schema = useMemo(() => resetPasswordSchema(isVi), [isVi]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit({ password }: ResetPasswordValues) {
    try {
      const { error } = await setNewPassword(password);
      if (error) {
        notifications.show({
          color: "warn",
          title: tr(
            "Không thể đặt lại mật khẩu",
            "Could not reset the password",
          ),
          message: authErrorMessage(error, isVi),
        });
        return;
      }
      notifications.show({
        color: "green",
        title: tr("Thành công", "Done"),
        message: tr(
          "Mật khẩu đã được cập nhật. Bạn đã được đăng nhập.",
          "Password updated. You are signed in.",
        ),
      });
      announceSessionChange();
      router.replace("/");
      router.refresh();
    } catch {
      notifications.show({
        color: "warn",
        message: authErrorMessage(null, isVi),
      });
    }
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
        label={tr("Mật khẩu mới", "New password")}
        placeholder={tr("Nhập mật khẩu mới", "Enter a new password")}
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
        label={tr("Nhập lại mật khẩu mới", "Repeat the new password")}
        placeholder={tr("Nhập lại để chắc chắn", "Type it again to be sure")}
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
        {tr("Đặt lại mật khẩu", "Reset password")}
      </Button>
    </Flex>
  );
}
