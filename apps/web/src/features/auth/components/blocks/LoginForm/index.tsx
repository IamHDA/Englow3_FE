"use client";

import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginValues } from "@/features/auth/schemas/loginSchema";
import type { LoginSubmitHandler } from "@/features/auth/types";

import classes from "./LoginForm.module.css";

type LoginFormProps = {
  onSubmit: LoginSubmitHandler;
  onSuccess?: () => void;
};

export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);

    const result = await onSubmit(values);
    if (result.status === "success") {
      onSuccess?.();
      return;
    }

    for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
      setError(field as keyof LoginValues, { type: "server", message });
    }

    if (result.message) {
      setFormError(result.message);
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {formError ? (
          <Alert color="red" role="alert" variant="light">
            {formError}
          </Alert>
        ) : null}

        <TextInput
          {...register("email")}
          type="email"
          label="Email"
          placeholder="example@example.com"
          autoComplete="email"
          error={errors.email?.message}
          classNames={{ label: classes.label, input: classes.input }}
        />

        <PasswordInput
          {...register("password")}
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <EyeOff size={18} /> : <Eye size={18} />
          }
          visibilityToggleButtonProps={{ "aria-label": "Toggle password visibility" }}
          classNames={{ label: classes.label, input: classes.input }}
        />

        <Button
          type="submit"
          loading={isSubmitting}
          variant="gradient"
          gradient={{ from: "amber.5", to: "amber.6", deg: 180 }}
          classNames={{ root: classes.submit, label: classes.submitLabel }}
          fullWidth
        >
          Login
        </Button>
      </Stack>
    </form>
  );
}
