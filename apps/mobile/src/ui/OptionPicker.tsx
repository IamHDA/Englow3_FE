import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, Button, TextField } from "./components";
import { colors, radius, spacing } from "./theme";

export type PickerOption = { value: string; label: string; hint?: string };

/**
 * A select field: shows the current pick and opens a searchable list. The
 * phone's stand-in for the web's Mantine Select.
 */
export function OptionPicker({
  label,
  hint,
  error,
  value,
  options,
  onChange,
  placeholder = "Chọn…",
  disabled,
  emptyMessage = "Chưa có lựa chọn phù hợp",
}: {
  label: string;
  hint?: string;
  error?: string | null;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const current = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? options.filter((option) => option.label.toLowerCase().includes(term))
      : options;
  }, [options, search]);

  return (
    <View style={styles.field}>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          setSearch("");
          setOpen(true);
        }}
        style={[
          styles.control,
          error ? { borderColor: colors.danger } : null,
          disabled ? { opacity: 0.5 } : null,
        ]}
      >
        <AppText
          tone={current ? "default" : "faint"}
          numberOfLines={2}
          style={{ flex: 1 }}
        >
          {current?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.below}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="muted" style={styles.below}>
          {hint}
        </AppText>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <AppText variant="heading" style={{ flex: 1 }}>
              {label}
            </AppText>
            <Button
              title="Đóng"
              size="sm"
              variant="ghost"
              onPress={() => setOpen(false)}
            />
          </View>
          {options.length > 8 ? (
            <TextField
              placeholder="Tìm…"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={(option) => option.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <AppText tone="muted" style={{ padding: spacing.lg }}>
                {emptyMessage}
              </AppText>
            }
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <AppText>{item.label}</AppText>
                    {item.hint ? (
                      <AppText variant="caption" tone="muted">
                        {item.hint}
                      </AppText>
                    ) : null}
                  </View>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  below: { marginTop: spacing.xs },
  sheet: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  optionSelected: { borderWidth: 1, borderColor: colors.primary },
});
