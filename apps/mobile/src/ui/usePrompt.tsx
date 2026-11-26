import { useCallback, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText, Button, Row, TextField } from "./components";
import { colors, radius, spacing } from "./theme";

type Request = {
  title: string;
  message?: string;
  placeholder?: string;
  initial?: string;
  confirmLabel?: string;
  required?: boolean;
  multiline?: boolean;
};

/**
 * A text question as a modal, on both platforms (React Native's Alert.prompt
 * exists on iOS only). `ask` resolves to the text, or null when cancelled.
 * Render `element` once in the screen.
 */
export function usePrompt() {
  const [request, setRequest] = useState<Request | null>(null);
  const [value, setValue] = useState("");
  const resolver = useRef<((value: string | null) => void) | null>(null);

  const ask = useCallback((next: Request) => {
    setValue(next.initial ?? "");
    setRequest(next);
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (result: string | null) => {
    resolver.current?.(result);
    resolver.current = null;
    setRequest(null);
  };

  const element = (
    <Modal
      visible={request !== null}
      transparent
      animationType="fade"
      onRequestClose={() => close(null)}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => close(null)}
          accessibilityLabel="Đóng"
        />
        <View style={styles.sheet}>
          <AppText variant="heading">{request?.title}</AppText>
          {request?.message ? (
            <AppText tone="muted" style={{ marginBottom: spacing.sm }}>
              {request.message}
            </AppText>
          ) : null}
          <TextField
            value={value}
            onChangeText={setValue}
            placeholder={request?.placeholder}
            multiline={request?.multiline}
            autoFocus
          />
          <Row gap={spacing.sm} style={{ justifyContent: "flex-end" }}>
            <Button
              title="Huỷ"
              variant="ghost"
              size="sm"
              onPress={() => close(null)}
            />
            <Button
              title={request?.confirmLabel ?? "Xác nhận"}
              size="sm"
              disabled={request?.required !== false && !value.trim()}
              onPress={() => close(value.trim())}
            />
          </Row>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  return { ask, element };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(18,26,51,0.45)",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
