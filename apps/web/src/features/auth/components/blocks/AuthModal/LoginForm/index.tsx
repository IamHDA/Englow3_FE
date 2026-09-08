"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Flex,
  Group,
  PasswordInput,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { forgetSessionOnBrowserClose, supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/shared/hooks/useLanguage";

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
  const { t } = useLanguage();
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
    const notificationId = notifications.show({
      loading: true,
      autoClose: false,
      withCloseButton: false,
      title: "Đang gửi email",
      message: "Vui lòng đợi trong giây láts...",
    });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    });
    if (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        autoClose: true,
        withCloseButton: true,
        color: "warn",
        title: "Không thể gửi email",
        message: error.message,
      });
      return;
    }
    notifications.update({
      id: notificationId,
      loading: false,
      autoClose: true,
      withCloseButton: true,
      color: "green",
      title: "Đã gửi email",
      message: "Kiểm tra hộp thư để đặt lại mật khẩu.",
    });
  }

  return (
    <Flex
      component="form"
      direction="column"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      gap={18}
    >
      <TextInput
        {...register("email")}
        label={t.auth.emailLabel}
        placeholder={t.auth.emailPlaceholder}
        error={errors.email?.message}
        classNames={{ label: classes.label, input: classes.input }}
      />

      <PasswordInput
        {...register("password")}
        label={t.auth.passwordLabel}
        placeholder={t.auth.passwordPlaceholder}
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
          label={t.auth.rememberMe}
          color="navy.9"
          size="xs"
        />
        <UnstyledButton
          type="button"
          fz={14}
          fw={600}
          c="navy.9"
          onClick={() => handleForgotPassword()}
        >
          {t.auth.forgotPassword}
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
        {t.auth.loginSubmit}
      </Button>
    </Flex>
  );
}
