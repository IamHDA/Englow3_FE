import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, radius, spacing } from "./theme";

export type IconName = ComponentProps<typeof Ionicons>["name"];

/* ------------------------------------------------------------------ Text -- */

type AppTextProps = {
  children: ReactNode;
  variant?: "title" | "heading" | "body" | "caption" | "label";
  tone?:
    | "default"
    | "muted"
    | "faint"
    | "primary"
    | "danger"
    | "success"
    | "inverse";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  selectable?: boolean;
};

const toneColor = {
  default: colors.text,
  muted: colors.textMuted,
  faint: colors.textFaint,
  primary: colors.primary,
  danger: colors.danger,
  success: colors.success,
  inverse: colors.white,
} as const;

export function AppText({
  children,
  variant = "body",
  tone = "default",
  style,
  numberOfLines,
  selectable,
}: AppTextProps) {
  return (
    <Text
      style={[styles[variant], { color: toneColor[tone] }, style]}
      numberOfLines={numberOfLines}
      selectable={selectable}
    >
      {children}
    </Text>
  );
}

/* ---------------------------------------------------------------- Screen -- */

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
  contentStyle?: StyleProp<ViewStyle>;
};

/** A page: safe-area aware, scrolls by default, pull-to-refresh when given `onRefresh`. */
export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  padded = true,
  edges = ["left", "right"],
  contentStyle,
}: ScreenProps) {
  const inner = [padded && styles.padded, contentStyle];
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, inner]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/* ---------------------------------------------------------------- Button -- */

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  size = "md",
  style,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const palette = buttonPalette[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={title}
      onPress={inactive ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        size === "sm" && styles.buttonSm,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={size === "sm" ? 16 : 18}
              color={palette.fg}
              style={{ marginRight: spacing.sm }}
            />
          ) : null}
          <Text
            style={[
              styles.buttonText,
              size === "sm" && { fontSize: fontSize.sm },
              { color: palette.fg },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const buttonPalette = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  accent: { bg: colors.accent, fg: colors.white, border: colors.accent },
  secondary: { bg: colors.surface, fg: colors.primary, border: colors.primary },
  ghost: { bg: "transparent", fg: colors.primary, border: "transparent" },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger },
} as const;

/* ------------------------------------------------------------- TextField -- */

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  style,
  ...rest
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="label" style={{ marginBottom: spacing.xs }}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        accessibilityLabel={label}
        style={[
          styles.input,
          rest.multiline && styles.inputMultiline,
          error ? { borderColor: colors.danger } : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText
          variant="caption"
          tone="danger"
          style={{ marginTop: spacing.xs }}
        >
          {error}
        </AppText>
      ) : hint ? (
        <AppText
          variant="caption"
          tone="muted"
          style={{ marginTop: spacing.xs }}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------------ Card -- */

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, onPress, style, testID }: CardProps) {
  if (!onPress) {
    return (
      <View testID={testID} style={[styles.card, style]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------- ListItem -- */

type ListItemProps = {
  title: string;
  subtitle?: string | null;
  icon?: IconName;
  iconColor?: string;
  right?: ReactNode;
  onPress?: () => void;
  testID?: string;
};

export function ListItem({
  title,
  subtitle,
  icon,
  iconColor = colors.primary,
  right,
  onPress,
  testID,
}: ListItemProps) {
  return (
    <Card onPress={onPress} testID={testID} style={styles.listItem}>
      {icon ? (
        <View
          style={[styles.iconBubble, { backgroundColor: `${iconColor}1A` }]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <AppText variant="label" numberOfLines={2}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        ) : null)}
    </Card>
  );
}

/* --------------------------------------------------------------- Section -- */

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.row, styles.sectionHeader]}>
        <AppText variant="heading" style={styles.flex}>
          {title}
        </AppText>
        {action}
      </View>
      {children}
    </View>
  );
}

/* ----------------------------------------------------------------- Badge -- */

export function Badge({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "accent" | "success" | "danger" | "neutral";
}) {
  const palette = {
    primary: [colors.primarySoft, colors.primary],
    accent: [colors.accentSoft, colors.accent],
    success: [colors.successSoft, colors.success],
    danger: [colors.dangerSoft, colors.danger],
    neutral: [colors.background, colors.textMuted],
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette[0] }]}>
      <Text style={[styles.badgeText, { color: palette[1] }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------- Progress -- */

export function ProgressBar({
  value,
  color = colors.primary,
}: {
  /** 0..1 */
  value: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <View
      style={styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={[
          styles.progressFill,
          { width: `${clamped * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

/* ---------------------------------------------------------------- States -- */

export function LoadingState({ label = "Đang tải…" }: { label?: string }) {
  return (
    <View style={styles.centered} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText tone="muted" style={{ marginTop: spacing.md }}>
        {label}
      </AppText>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.centered}>
      <Ionicons
        name="cloud-offline-outline"
        size={40}
        color={colors.textFaint}
      />
      <AppText tone="muted" style={styles.stateText}>
        {message}
      </AppText>
      {onRetry ? (
        <Button
          title="Thử lại"
          variant="secondary"
          onPress={onRetry}
          size="sm"
        />
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon = "file-tray-outline",
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.centered}>
      <Ionicons name={icon} size={40} color={colors.textFaint} />
      <AppText variant="label" style={{ marginTop: spacing.md }}>
        {title}
      </AppText>
      {message ? (
        <AppText tone="muted" style={styles.stateText}>
          {message}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

/** A one-line message inside a form: what went wrong, or that it worked. */
export function Notice({
  message,
  tone = "danger",
}: {
  message: string | null | undefined;
  tone?: "danger" | "success" | "info";
}) {
  if (!message) return null;
  const palette = {
    danger: [colors.dangerSoft, colors.danger],
    success: [colors.successSoft, colors.success],
    info: [colors.primarySoft, colors.primary],
  }[tone];
  return (
    <View
      style={[styles.notice, { backgroundColor: palette[0] }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={{ color: palette[1], fontSize: fontSize.sm }}>
        {message}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------- Choice -- */

/** A selectable option: answer choices, onboarding options, filters. */
export function Choice({
  label,
  selected,
  onPress,
  state,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress?: () => void;
  /** After grading: mark the right and the wrong pick. */
  state?: "correct" | "incorrect" | null;
  testID?: string;
}) {
  const border =
    state === "correct"
      ? colors.success
      : state === "incorrect"
        ? colors.danger
        : selected
          ? colors.primary
          : colors.border;
  const bg =
    state === "correct"
      ? colors.successSoft
      : state === "incorrect"
        ? colors.dangerSoft
        : selected
          ? colors.primarySoft
          : colors.surface;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, { borderColor: border, backgroundColor: bg }]}
    >
      <AppText style={styles.flex}>{label}</AppText>
      {selected || state ? (
        <Ionicons
          name={
            state === "incorrect"
              ? "close-circle"
              : state === "correct" || selected
                ? "checkmark-circle"
                : "ellipse-outline"
          }
          size={20}
          color={border}
        />
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Chip -- */

/** A compact toggle for filters: topics, levels, statuses. */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.white : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** A horizontal strip of chips that scrolls when it does not fit. */
export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
      style={{ marginBottom: spacing.md, flexGrow: 0 }}
    >
      {children}
    </ScrollView>
  );
}

/** Previous / next for paged lists. */
export function Pager({
  page,
  totalPages,
  onChange,
}: {
  /** zero-based, as the BFF counts */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <View
      style={[
        styles.row,
        { justifyContent: "space-between", marginTop: spacing.md },
      ]}
    >
      <Button
        title="Trước"
        size="sm"
        variant="secondary"
        icon="chevron-back"
        disabled={page <= 0}
        onPress={() => onChange(page - 1)}
      />
      <AppText tone="muted" variant="caption">
        Trang {page + 1}/{totalPages}
      </AppText>
      <Button
        title="Sau"
        size="sm"
        variant="secondary"
        disabled={page >= totalPages - 1}
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

export function Row({
  children,
  gap = spacing.sm,
  style,
  wrap,
}: {
  children: ReactNode;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  wrap?: boolean;
}) {
  return (
    <View style={[styles.row, { gap }, wrap && { flexWrap: "wrap" }, style]}>
      {children}
    </View>
  );
}

export function Spacer({ size = spacing.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center" },
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  padded: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontWeight: "700", lineHeight: 34 },
  heading: { fontSize: fontSize.lg, fontWeight: "700", lineHeight: 24 },
  body: { fontSize: fontSize.md, lineHeight: 22 },
  caption: { fontSize: fontSize.xs, lineHeight: 16 },
  label: { fontSize: fontSize.md, fontWeight: "600", lineHeight: 22 },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  buttonSm: { minHeight: 36, paddingHorizontal: spacing.md },
  buttonText: { fontSize: fontSize.md, fontWeight: "600" },
  field: { marginBottom: spacing.md },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputMultiline: { minHeight: 120, textAlignVertical: "top" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginBottom: spacing.xl },
  sectionHeader: { marginBottom: spacing.md },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: "600" },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.pill },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    minHeight: 240,
  },
  stateText: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  notice: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: "500" },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
});
