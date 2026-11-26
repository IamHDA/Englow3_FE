import { Stack, router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { Avatar } from "@/features/shared/Avatar";
import { errorMessage } from "@/lib/errors";
import {
  Gender,
  useAvatarPresetsQuery,
  useChooseAvatarMutation,
  useUpdateProfileMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Choice,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { colors, radius, spacing } from "@/ui/theme";

const GENDERS = [
  { value: Gender.MALE, label: "Nam" },
  { value: Gender.FEMALE, label: "Nữ" },
  { value: Gender.OTHER, label: "Khác" },
];

const PROFILE_ERRORS: Record<string, string> = {
  DISPLAY_NAME_TAKEN: "Tên hiển thị này đã có người dùng.",
};

export default function EditProfileScreen() {
  const { me, refetchMe } = useAuth();
  const presets = useAvatarPresetsQuery();
  const [update, updateState] = useUpdateProfileMutation();
  const [choose, chooseState] = useChooseAvatarMutation();
  const [fullName, setFullName] = useState(me?.fullName ?? "");
  const [displayName, setDisplayName] = useState(me?.displayName ?? "");
  const [birthDate, setBirthDate] = useState(me?.birthDate ?? "");
  const [gender, setGender] = useState<Gender | null>(me?.gender ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{
    text: string;
    tone: "danger" | "success";
  } | null>(null);

  if (!me) return null;

  async function save() {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2)
      next.fullName = "Họ tên cần ít nhất 2 ký tự.";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(displayName.trim()))
      next.displayName = "3-20 ký tự: chữ không dấu, số hoặc dấu gạch dưới.";
    if (
      birthDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
        birthDate > new Date().toISOString().slice(0, 10))
    )
      next.birthDate = "Ngày sinh theo dạng YYYY-MM-DD và không ở tương lai.";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await update({
        variables: {
          input: {
            fullName: fullName.trim(),
            displayName: displayName.trim(),
            birthDate: birthDate || null,
            gender,
          },
        },
      });
      await refetchMe();
      router.back();
    } catch (failure) {
      setNotice({
        text: errorMessage(failure, PROFILE_ERRORS),
        tone: "danger",
      });
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: "Sửa hồ sơ" }} />
      <Notice message={notice?.text} tone={notice?.tone} />
      <Section title="Ảnh đại diện">
        <Row wrap gap={spacing.sm}>
          <Avatar url={me.avatarUrl} name={me.displayName} size={64} />
          {(presets.data?.avatarPresets ?? []).map((preset) => (
            <Pressable
              key={preset.id}
              accessibilityRole="button"
              accessibilityLabel="Chọn ảnh đại diện này"
              disabled={chooseState.loading}
              onPress={() =>
                void choose({ variables: { preset: preset.id } })
                  .then(() => refetchMe())
                  .then(() =>
                    setNotice({
                      text: "Đã đổi ảnh đại diện.",
                      tone: "success",
                    }),
                  )
                  .catch((failure) =>
                    setNotice({ text: errorMessage(failure), tone: "danger" }),
                  )
              }
            >
              <View
                style={{
                  borderRadius: radius.pill,
                  borderWidth: 2,
                  borderColor:
                    preset.url === me.avatarUrl
                      ? colors.primary
                      : "transparent",
                }}
              >
                <Image
                  source={{ uri: preset.url }}
                  style={{ width: 52, height: 52, borderRadius: 26 }}
                />
              </View>
            </Pressable>
          ))}
        </Row>
      </Section>
      <TextField
        label="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
      />
      <TextField
        label="Tên hiển thị"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="none"
        error={errors.displayName}
      />
      <TextField
        label="Ngày sinh"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        keyboardType="numbers-and-punctuation"
        error={errors.birthDate}
      />
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        Giới tính
      </AppText>
      <Row gap={spacing.sm} style={{ marginBottom: spacing.lg }}>
        {GENDERS.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            selected={gender === option.value}
            onPress={() => setGender(option.value)}
          />
        ))}
      </Row>
      <Button
        title="Lưu"
        loading={updateState.loading}
        onPress={() => void save()}
      />
      <AppText variant="caption" tone="muted" style={{ marginTop: spacing.sm }}>
        Email: {me.email} (không đổi được trong ứng dụng)
      </AppText>
    </Screen>
  );
}
