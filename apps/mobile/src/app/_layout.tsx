import { ApolloProvider } from "@apollo/client/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { apolloClient } from "@/lib/apollo";
import { errorMessage } from "@/lib/errors";
import { Button, ErrorState, LoadingState, Screen } from "@/ui/components";
import { colors } from "@/ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const {
    initializing,
    session,
    me,
    meLoading,
    meError,
    refetchMe,
    recovering,
    signOut,
  } = useAuth();

  if (initializing || (session && meLoading)) {
    return (
      <Screen scroll={false} edges={["top", "bottom"]}>
        <LoadingState label="Đang mở Englow3…" />
      </Screen>
    );
  }

  // Signed in, but the profile would not load: say so rather than show screens
  // that would all fail the same way.
  if (session && !me && meError && !recovering) {
    return (
      <Screen scroll={false} edges={["top", "bottom"]}>
        <ErrorState
          message={errorMessage(meError)}
          onRetry={() => void refetchMe()}
        />
        <Button
          title="Đăng xuất"
          variant="ghost"
          onPress={() => void signOut()}
        />
      </Screen>
    );
  }

  const signedIn = Boolean(session && me) && !recovering;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={recovering}>
        <Stack.Screen
          name="auth/reset"
          options={{ title: "Đặt mật khẩu mới" }}
        />
      </Stack.Protected>

      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: "Thiết lập lộ trình", presentation: "modal" }}
        />
      </Stack.Protected>

      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}
