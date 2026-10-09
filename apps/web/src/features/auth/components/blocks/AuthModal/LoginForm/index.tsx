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
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signInWithPassword } from "@/features/auth/api/authClient";
import { announceSessionChange } from "@/features/auth/api/sessionSync";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { homeForRole } from "@/features/auth/types";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "../AuthModal.module.css";

function loginSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z.object({
    email: z
      .string()
      .min(1, tr("Vui lòng nhập email", "Enter your email"))
      .email(tr("Email không hợp lệ", "That email is not valid")),
    password: z
      .string()
      .min(1, tr("Vui lòng nhập mật khẩu", "Enter your password")),
    rememberMe: z.boolean(),
  });
}

type LoginValues = z.infer<ReturnType<typeof loginSchema>>;

type LoginFormProps = {
  onSuccess: () => void;
  /** Leaving the modal for another page - the forgot-password one. */
  onLeave: () => void;
};

export function LoginForm({ onSuccess, onLeave }: LoginFormProps) {
  const router = useRouter();
  const { t, isVi } = useLanguage();
  const schema = useMemo(() => loginSchema(isVi), [isVi]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit({ email, password, rememberMe }: LoginValues) {
    try {
      const result = await signInWithPassword({ email, password, rememberMe });
      if (result.error) {
        notifications.show({
          color: "warn",
          title: isVi ? "Không thể đăng nhập" : "Could not sign in",
          message: authErrorMessage(result.error, isVi),
        });
        return;
      }
      announceSessionChange();
      onSuccess();
      // Each role lands where its work is: staff and administrators in the
      // administration area, a learner on the page they signed in from.
      const home = homeForRole(result.session?.role);
      if (home) {
        router.push(home);
      } else {
        router.refresh();
      }
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
