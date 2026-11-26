import { Redirect, Stack } from "expo-router";

import { isBackOfficeRole, useAuth } from "@/features/auth/AuthProvider";
import { colors } from "@/ui/theme";

/** Back office: staff and administrators only. The backend checks every call as well. */
export default function AdminLayout() {
  const { me } = useAuth();
  if (!isBackOfficeRole(me?.role)) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
