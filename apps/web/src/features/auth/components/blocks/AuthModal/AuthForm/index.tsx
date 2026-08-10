"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Flex,
  PasswordInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AUTH_MODES,
  authModeCopy,
  type AuthMode,
} from "@/features/auth/constants/authModes";
import {
  createAuthSchema,
  type AuthFormValues,
} from "@/features/auth/schemas/authSchema";
import { signIn } from "@/features/auth/signIn";
import { signUp } from "@/features/auth/signUp";
import type { AuthFieldErrors } from "@/features/auth/types";

import classes from "./AuthForm.module.css";

/** Mantine hands the toggle its current state, so one component covers both. */
function PasswordVisibilityIcon({ reveal }: { reveal: boolean }) {
  return reveal ? <EyeOff size={17} /> : <Eye size={17} />;
}

type AuthFormProps = {
  mode: AuthMode;
  /** Called only when a session actually exists, so the modal can close. */
  onSuccess: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const isSignup = mode === AUTH_MODES.signup;
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthSchema(mode)),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const submit = handleSubmit(async ({ email, password }) => {
    setFormError(null);
    setNotice(null);

    const result = await (isSignup ? signUp : signIn)({ email, password });

    if (result.status === "success") {
      onSuccess();
      return;
    }

    if (result.status === "notice") {
      setNotice(result.message);
      return;
    }

    const fieldErrors: AuthFieldErrors = result.fieldErrors ?? {};
    for (const [field, message] of Object.entries(fieldErrors)) {
      setError(field as keyof AuthFormValues, { type: "server", message });
    }

    if (result.message) {
      setFormError(result.message);
    }
  });

  const fieldClassNames = {
    label: classes.label,
    input: classes.input,
    innerInput: classes.innerInput,
    error: classes.error,
  };

  return (
    <Flex
      component="form"
      direction="column"
      gap={18}
      onSubmit={submit}
      noValidate
    >
      <Stack gap={14}>
        {formError && (
          <Alert
            color="red"
            role="alert"
            variant="light"
            p="xs"
            classNames={{ message: classes.alertMessage }}
          >
            {formError}
          </Alert>
        )}

        {notice && (
          <Alert
            color="teal"
            role="status"
            variant="light"
            p="xs"
            classNames={{ message: classes.alertMessage }}
          >
            {notice}
          </Alert>
        )}

        <TextInput
          {...register("email")}
          type="email"
          label="Email"
          placeholder="example@example.com"
          autoComplete="email"
          error={errors.email?.message}
          classNames={fieldClassNames}
        />

        <PasswordInput
          {...register("password")}
          label="Password"
          placeholder="Enter your password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          visibilityToggleIcon={PasswordVisibilityIcon}
          visibilityToggleButtonProps={{
            "aria-label": "Toggle password visibility",
          }}
          error={errors.password?.message}
          classNames={fieldClassNames}
        />

        {isSignup && (
          <PasswordInput
            {...register("confirmPassword")}
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            visibilityToggleIcon={PasswordVisibilityIcon}
            visibilityToggleButtonProps={{
              "aria-label": "Toggle password visibility",
            }}
            error={errors.confirmPassword?.message}
            classNames={fieldClassNames}
          />
        )}
      </Stack>

      <Button
        type="submit"
        loading={isSubmitting}
        variant="gradient"
        gradient={{ from: "amber.5", to: "amber.6", deg: 180 }}
        classNames={{ root: classes.submit, label: classes.submitLabel }}
      >
        {authModeCopy[mode].submitLabel}
      </Button>
    </Flex>
  );
}
