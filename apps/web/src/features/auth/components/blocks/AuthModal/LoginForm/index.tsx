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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { homeForRole, toAuthSession } from "@/features/auth/types";
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
  /** Leaving the modal for another page - the forgot-password one. */
  onLeave: () => void;
};

export function LoginForm({ onSuccess, onLeave }: LoginFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit({ email, password, rememberMe }: LoginValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể đăng nhập",
        message: authErrorMessage(error),
      });
      return;
    }
    if (!rememberMe) {
      forgetSessionOnBrowserClose();
    }
    onSuccess();
    // Each role lands where its work is: staff and administrators in the
    // administration area, a learner on the page they signed in from.
    const home = homeForRole(toAuthSession(data?.user)?.role);
    if (home) {
      router.push(home);
    } else {
      router.refresh();
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
      <TextInput
        {...register("email")}
        type="email"
        autoComplete="email"
        label={t.auth.emailLabel}
        placeholder={t.auth.emailPlaceholder}
        error={errors.email?.message}
        classNames={{ label: classes.label, input: classes.input }}
      />

      <PasswordInput
        {...register("password")}
        autoComplete="current-password"
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
        {/* A page of its own: the reset flow needs room to say what happened
            and to offer a resend, which a toast over this modal did not. */}
        <UnstyledButton
          component={Link}
          href="/auth/forgot"
          fz={14}
          fw={600}
          c="navy.9"
          onClick={onLeave}
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
