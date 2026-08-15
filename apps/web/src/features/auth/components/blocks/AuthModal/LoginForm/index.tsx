"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { forgetSessionOnBrowserClose, supabase } from "@/lib/supabase/client";

import classes from "../AuthModal.module.css";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit({ email, password, rememberMe }: LoginValues) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể đăng nhập",
        message: error.message,
      });
      return;
    }
    if (!rememberMe) {
      forgetSessionOnBrowserClose();
    }
    router.refresh();
    onSuccess();
  }

  async function handleForgotPassword() {
    const email = getValues("email");
    if (!z.string().email().safeParse(email).success) {
      setError("email", {
        type: "manual",
        message: "Nhập email hợp lệ trước khi lấy lại mật khẩu",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể gửi email",
        message: error.message,
      });
      return;
    }
    notifications.show({
      color: "green",
      title: "Đã gửi email",
      message: "Kiểm tra hộp thư để đặt lại mật khẩu.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={18}>
        <TextInput
          {...register("email")}
          label="Email"
          placeholder="example@example.com"
          error={errors.email?.message}
          classNames={{ label: classes.label, input: classes.input }}
        />

        <PasswordInput
          {...register("password")}
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          error={errors.password?.message}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? (
              <EyeOff aria-hidden="true" size={20} />
            ) : (
              <Eye aria-hidden="true" size={20} />
            )
          }
          classNames={{ label: classes.label, input: classes.input }}
        />

        <Group justify="space-between" wrap="nowrap">
          <Checkbox
            {...register("rememberMe")}
            label="Ghi nhớ đăng nhập"
            color="navy.9"
            size="xs"
          />
          <UnstyledButton
            type="button"
            fz={14}
            fw={600}
            c="navy.9"
            onClick={() => void handleForgotPassword()}
          >
            Quên mật khẩu?
          </UnstyledButton>
        </Group>

        <Button
          type="submit"
          loading={isSubmitting}
          color="orange.5"
          radius={12}
          h={48}
          fz={16}
          fw={700}
        >
          Đăng nhập
        </Button>
      </Stack>
    </form>
  );
}
