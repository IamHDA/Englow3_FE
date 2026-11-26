import { Stack } from "expo-router";
import { useState } from "react";

import { AdminOnly } from "@/features/admin/AdminOnly";
import { formatDateTime } from "@/features/shared/labels";
import { errorMessage } from "@/lib/errors";
import {
  useAdminLevelCheckWeightsQuery,
  useSetLevelCheckWeightMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Card,
  Notice,
  Row,
  Screen,
  Section,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const WEIGHT_ERRORS: Record<string, string> = {
  LEVEL_CHECK_WEIGHTS_INVALID:
    "Ba trọng số phải cộng lại bằng 100 và có ít nhất một phần viết (từ vựng hoặc nghe).",
  LEVEL_CHECK_PURPOSE_UNKNOWN: "Mục tiêu học này không tồn tại.",
};

/** How the level check's three parts count, per learning purpose. Administrators only. */
export default function LevelCheckWeightsScreen() {
  return (
    <AdminOnly>
      <LevelCheckWeights />
    </AdminOnly>
  );
}

function LevelCheckWeights() {
  const weights = useAdminLevelCheckWeightsQuery({
    fetchPolicy: "cache-and-network",
  });
  const [save, saveState] = useSetLevelCheckWeightMutation();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    vocabulary: "",
    listening: "",
    speaking: "",
    priority: "",
  });
  const [error, setError] = useState<string | null>(null);

  async function submit(purposeCode: string) {
    const values = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, Number(value)]),
    ) as Record<keyof typeof form, number>;
    if (
      Object.values(values).some(
        (value) => !Number.isInteger(value) || value < 0 || value > 100,
      )
    ) {
      setError("Mỗi giá trị là số nguyên từ 0 đến 100.");
      return;
    }
    if (values.vocabulary + values.listening + values.speaking !== 100) {
      setError("Từ vựng + nghe + nói phải bằng 100.");
      return;
    }
    setError(null);
    try {
      await save({ variables: { input: { purposeCode, ...values } } });
      setEditing(null);
    } catch (failure) {
      setError(errorMessage(failure, WEIGHT_ERRORS));
    }
  }

  return (
    <Screen
      refreshing={weights.loading && Boolean(weights.data)}
      onRefresh={() => void weights.refetch()}
    >
      <Stack.Screen options={{ title: "Trọng số kiểm tra trình độ" }} />
      <Notice message={error} />
      <QueryView
        loading={weights.loading}
        error={weights.error}
        data={weights.data?.levelCheckWeights}
        onRetry={() => void weights.refetch()}
      >
        {(data) => (
          <>
            {data.purposes.map((purpose) => {
              const current = purpose.inForce;
              const open = editing === purpose.purposeCode;
              return (
                <Card
                  key={purpose.purposeCode}
                  style={{ marginBottom: spacing.sm }}
                >
                  <AppText variant="label">
                    {purpose.displayName ?? "Mặc định"}
                  </AppText>
                  {current ? (
                    <AppText tone="muted">
                      Từ vựng {current.vocabulary} · Nghe {current.listening} ·
                      Nói {current.speaking} · Ưu tiên {current.priority}
                    </AppText>
                  ) : (
                    <AppText tone="muted">Dùng trọng số mặc định</AppText>
                  )}
                  {open ? (
                    <>
                      <Row gap={spacing.sm} style={{ marginTop: spacing.sm }}>
                        {(
                          [
                            "vocabulary",
                            "listening",
                            "speaking",
                            "priority",
                          ] as const
                        ).map((key) => (
                          <TextField
                            key={key}
                            label={
                              {
                                vocabulary: "Từ vựng",
                                listening: "Nghe",
                                speaking: "Nói",
                                priority: "Ưu tiên",
                              }[key]
                            }
                            value={form[key]}
                            onChangeText={(value) =>
                              setForm((currentForm) => ({
                                ...currentForm,
                                [key]: value,
                              }))
                            }
                            keyboardType="number-pad"
                            style={{ minWidth: 64 }}
                          />
                        ))}
                      </Row>
                      <Row gap={spacing.sm}>
                        <Button
                          title="Lưu"
                          size="sm"
                          loading={saveState.loading}
                          onPress={() => void submit(purpose.purposeCode)}
                        />
                        <Button
                          title="Huỷ"
                          size="sm"
                          variant="ghost"
                          onPress={() => setEditing(null)}
                        />
                      </Row>
                    </>
                  ) : (
                    <Button
                      title="Sửa"
                      size="sm"
                      variant="secondary"
                      style={{ alignSelf: "flex-start", marginTop: spacing.sm }}
                      onPress={() => {
                        setForm({
                          vocabulary: String(current?.vocabulary ?? 40),
                          listening: String(current?.listening ?? 40),
                          speaking: String(current?.speaking ?? 20),
                          priority: String(current?.priority ?? 0),
                        });
                        setEditing(purpose.purposeCode);
                      }}
                    />
                  )}
                </Card>
              );
            })}
            {data.history.length > 0 ? (
              <Section title="Lịch sử thay đổi">
                {data.history.slice(0, 15).map((change) => (
                  <AppText key={change.id} variant="caption" tone="muted">
                    {formatDateTime(change.effectiveFrom)} ·{" "}
                    {change.purposeCode}: {change.vocabulary}/{change.listening}
                    /{change.speaking} (ưu tiên {change.priority})
                  </AppText>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </QueryView>
    </Screen>
  );
}
