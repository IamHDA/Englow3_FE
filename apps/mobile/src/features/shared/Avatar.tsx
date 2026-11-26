import { Image, StyleSheet, View } from "react-native";

import { AppText } from "@/ui/components";
import { colors } from "@/ui/theme";

/** A round avatar, or the name's initial when there is no picture. */
export function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null;
  name?: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (url)
    return (
      <Image
        source={{ uri: url }}
        style={[style, styles.image]}
        accessibilityLabel={name ?? "Ảnh đại diện"}
      />
    );
  return (
    <View
      style={[style, styles.fallback]}
      accessibilityLabel={name ?? "Ảnh đại diện"}
    >
      <AppText variant="label" tone="primary" style={{ fontSize: size * 0.4 }}>
        {(name ?? "?").trim().charAt(0).toUpperCase() || "?"}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  fallback: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
