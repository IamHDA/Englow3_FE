import { Stack } from "expo-router";

import { colors } from "@/ui/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Tạo tài khoản" }} />
      <Stack.Screen name="forgot" options={{ title: "Quên mật khẩu" }} />
    </Stack>
  );
}
