"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { passwordSchema } from "@/features/auth/schemas/password";
import { supabase } from "@/lib/supabase/client";

const resetPasswordSchema = z.object({
  password: passwordSchema,
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
    defaultValues: { password: "" },
  });

  async function onSubmit({ password }: ResetPasswordValues) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể đặt lại mật khẩu",
        message: error.message,
      });
      return;
    }
    notifications.show({
      color: "green",
      title: "Thành công",
      message: "Mật khẩu đã được cập nhật.",
    });
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={18}>
        <PasswordInput
          {...register("password")}
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
      </Stack>
    </form>
  );
}
