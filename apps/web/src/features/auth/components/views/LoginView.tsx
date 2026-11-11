"use client";
import { Button, Container, Divider, Paper, Stack, Title } from "@mantine/core";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { LoginForm } from "../blocks/AuthModal/LoginForm";
import { RegisterForm } from "../blocks/AuthModal/RegisterForm";
import { AuthSocialButtons } from "../blocks/AuthModal/AuthSocialButtons";

const signedIn = () => {};
export function LoginView() {
  const { isVi } = useLanguage();
  const [register, setRegister] = useState(false);
  return (
    <Container size={480} py="xl">
      <Paper withBorder p={{ base: "md", sm: "xl" }} radius="lg">
        <Stack gap="lg">
          <Title order={1} size="h2">
            {register
              ? isVi
                ? "Tạo tài khoản"
                : "Create an account"
              : isVi
                ? "Đăng nhập để tiếp tục"
                : "Sign in to continue"}
          </Title>
          {register ? (
            <RegisterForm onSuccess={signedIn} />
          ) : (
            <LoginForm onSuccess={signedIn} onLeave={signedIn} />
          )}
          <Divider label={isVi ? "Hoặc" : "Or"} />
          <AuthSocialButtons />
          <Button variant="subtle" onClick={() => setRegister(!register)}>
            {register
              ? isVi
                ? "Đã có tài khoản? Đăng nhập"
                : "Have an account? Sign in"
              : isVi
                ? "Chưa có tài khoản? Đăng ký"
                : "Need an account? Register"}
          </Button>
          <Button component={Link} href="/" variant="default">
            {isVi ? "Về trang chủ" : "Back to home"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
