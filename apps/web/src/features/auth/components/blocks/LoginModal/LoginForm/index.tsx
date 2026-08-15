"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import { supabase } from "@/lib/supabase/client";

import classes from "./LoginForm.module.css";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setError("root", { type: "server", message: error.message });
      return;
    }
    router.refresh();
    onSuccess();
  }

  async function handleOAuthClick(provider: "google" | "facebook") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("root", { type: "server", message: error.message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={24}>
        {errors.root ? (
          <Alert
            color="red"
            variant="light"
            icon={<CircleAlert aria-hidden="true" size={18} />}
          >
            {errors.root.message}
          </Alert>
        ) : null}

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
          classNames={{
            label: classes.passwordLabel,
            input: classes.input,
          }}
        />

        <Button
          type="submit"
          loading={isSubmitting}
          variant="gradient"
          gradient={{ from: "amber.5", to: "amber.6", deg: 180 }}
          radius={10}
          h={48}
          fz={14}
          fw={700}
        >
          Đăng nhập
        </Button>

        <Divider
          label="Hoặc đăng nhập bằng"
          labelPosition="center"
          classNames={{ label: classes.dividerLabel }}
        />

        <Group justify="center" gap={10}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={44}
            radius="xl"
            aria-label="Tiếp tục với Google"
            onClick={() => void handleOAuthClick("google")}
          >
            <FcGoogle aria-hidden="true" size={24} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            size={44}
            radius="xl"
            aria-label="Tiếp tục với Facebook"
            onClick={() => void handleOAuthClick("facebook")}
          >
            <FaFacebook aria-hidden="true" size={24} color="#1877F2" />
          </ActionIcon>
        </Group>
      </Stack>
    </form>
  );
}
