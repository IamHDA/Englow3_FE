import { Stack } from "expo-router";

import { TourProvider } from "@/features/tour/TourProvider";
import { colors } from "@/ui/theme";

/** Every signed-in screen. The tabs sit at the bottom of this stack; feature screens push on top. */
export default function AppLayout() {
  return (
    <TourProvider>
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* A nested stack with its own headers. */}
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack>
    </TourProvider>
  );
}
