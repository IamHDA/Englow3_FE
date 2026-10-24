"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  PasswordInput,
  Portal,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { signInWithPassword } from "@/features/auth/api/authClient";
import { announceSessionChange } from "@/features/auth/api/sessionSync";
import { authErrorMessage } from "@/features/auth/authErrorMessage";
import { homeForRole } from "@/features/auth/types";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { ResendConfirmation } from "../../ResendConfirmation";

import classes from "../AuthModal.module.css";

function loginSchema(isVi: boolean) {
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return z.object({
    email: z
      .string()
      .trim()
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
  const [isNavigating, startTransition] = useTransition();
  const [authenticated, setAuthenticated] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const completed = useRef(false);
  useEffect(() => {
    if (authenticated && !isNavigating && !completed.current) {
      completed.current = true;
      onSuccess();
    }
  }, [authenticated, isNavigating, onSuccess]);
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
    if (authenticated || isNavigating) return;
    try {
      const result = await signInWithPassword({ email, password, rememberMe });
      if (result.error) {
        setUnconfirmedEmail(
          result.error.code === "email_not_confirmed" ? email : null,
        );
        notifications.show({
          color: "warn",
          title: isVi ? "Không thể đăng nhập" : "Could not sign in",
          message: authErrorMessage(result.error, isVi),
        });
        return;
      }
      announceSessionChange();
      setAuthenticated(true);
      // Each role lands where its work is: staff and administrators in the
      // administration area, a learner on the page they signed in from.
      const home = homeForRole(result.session?.role);
      startTransition(() => {
        if (home) router.push(home);
        else router.refresh();
      });
    } catch {
      notifications.show({
        color: "warn",
        message: authErrorMessage(null, isVi),
      });
    }
  }

  // Từ lúc bấm đến lúc trang kế tiếp sẵn sàng mất một, hai giây (hỏi Supabase,
  // rồi dựng lại trang). Nút xoay một mình dễ như đứng hình trên trang chủ,
  // nên che cả màn hình bằng một tình trạng rõ ràng cho tới khi chuyển xong.
  const signingIn = isSubmitting || isNavigating || authenticated;

  return (
    <Flex
      component="form"
      direction="column"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      gap={18}
    >
      {signingIn && (
        <Portal>
          <LoadingOverlay
            visible
            zIndex={1000}
            overlayProps={{ blur: 3, backgroundOpacity: 0.85 }}
            style={{ position: "fixed", inset: 0 }}
            loaderProps={{
              children: (
                <Stack align="center" gap="sm" role="status">
                  <Loader color="orange.5" />
                  <Text fw={600}>
                    {isVi ? "Đang đăng nhập…" : "Signing you in…"}
                  </Text>
                </Stack>
              ),
            }}
          />
        </Portal>
      )}
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
        visibilityToggleButtonProps={{
          "aria-label": isVi
            ? "Hiện hoặc ẩn mật khẩu"
            : "Show or hide password",
        }}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )
        }
        classNames={{ label: classes.label, input: classes.input }}
      />

      <Text size="xs" c="ink.7">
        {isVi
          ? "Đăng ký bằng Google hoặc Facebook? Dùng đúng nút bên dưới, hoặc chọn Quên mật khẩu để đặt mật khẩu email."
          : "Signed up with Google or Facebook? Use the matching button below, or choose Forgot password to set an email password."}
      </Text>
      {unconfirmedEmail && <ResendConfirmation email={unconfirmedEmail} />}

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
        loading={signingIn}
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
