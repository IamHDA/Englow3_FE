import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

import { useChatUnreadCountQuery } from "@/lib/graphql/generated";
import { colors } from "@/ui/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function icon(name: IconName, focusedName: IconName) {
  function TabIcon({
    color,
    focused,
    size,
  }: {
    color: ColorValue;
    focused: boolean;
    size: number;
  }) {
    return (
      <Ionicons
        name={focused ? focusedName : name}
        // RN 0.88 widened ColorValue to processed (numeric) colors, which
        // the icon font cannot take; the tab bar only ever passes our strings.
        color={typeof color === "number" ? undefined : (color ?? undefined)}
        size={size}
      />
    );
  }
  return TabIcon;
}

export default function TabsLayout() {
  // A light poll for the badge; the chat screen itself refreshes on focus.
  const unread = useChatUnreadCountQuery({
    pollInterval: 60_000,
    fetchPolicy: "cache-and-network",
  });
  const unreadCount = unread.data?.chatUnreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerTitleStyle: { color: colors.text },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: icon("home-outline", "home"),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{ title: "Học tập", tabBarIcon: icon("book-outline", "book") }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Luyện thi",
          tabBarIcon: icon("document-text-outline", "document-text"),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Cộng đồng",
          tabBarIcon: icon("people-outline", "people"),
          tabBarBadge:
            unreadCount > 0
              ? unreadCount > 99
                ? "99+"
                : unreadCount
              : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tôi",
          tabBarIcon: icon("person-circle-outline", "person-circle"),
        }}
      />
    </Tabs>
  );
}
