"use client";

import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

import type {
  LevelCheckWeightChangeFieldsFragment,
  LevelCheckWeightsFieldsFragment,
} from "@/lib/graphql/generated";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useAdminLevelCheckWeightsQuery,
  useSetLevelCheckWeightMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

type Purpose = LevelCheckWeightsFieldsFragment["purposes"][number];
type Change = LevelCheckWeightChangeFieldsFragment;

type Draft = {
  purposeCode: string;
  label: string;
  vocabulary: number;
  listening: number;
  speaking: number;
  priority: number;
};

/** What the form refuses before sending, by the same rules the backend keeps. */
function problemWith(draft: Draft, isVi: boolean): string | null {
  const parts = [draft.vocabulary, draft.listening, draft.speaking];
  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 100)) {
    return isVi
      ? "Mỗi trọng số là số nguyên từ 0 đến 100."
      : "Each weight is a whole number from 0 to 100.";
  }
  if (parts.reduce((sum, part) => sum + part, 0) !== 100) {
    return isVi
      ? "Ba trọng số phải cộng lại bằng 100."
      : "The three weights must add up to 100.";
  }
  if (draft.vocabulary + draft.listening === 0) {
    return isVi
      ? "Từ vựng và nghe không thể cùng bằng 0: khi người học bỏ qua phần nói, trình độ chỉ còn tính từ hai phần này."
      : "Vocabulary and listening cannot both be 0: when a learner skips speaking, the level comes from these two alone.";
  }
  if (
    !Number.isInteger(draft.priority) ||
    draft.priority < 0 ||
    draft.priority > 100
  ) {
    return isVi
      ? "Ưu tiên là số nguyên từ 0 đến 100."
      : "Priority is a whole number from 0 to 100.";
  }
  return null;
}

const ERROR_MESSAGES: Record<string, { vi: string; en: string }> = {
  LEVEL_CHECK_WEIGHTS_INVALID: {
    vi: "Trọng số không hợp lệ: ba phần phải cộng lại bằng 100 và từ vựng + nghe phải lớn hơn 0.",
    en: "Invalid weights: the three must add up to 100, with vocabulary + listening above 0.",
  },
  LEVEL_CHECK_PURPOSE_UNKNOWN: {
    vi: "Mục đích học này không còn tồn tại. Tải lại trang.",
    en: "This learning purpose no longer exists. Reload the page.",
  },
  FORBIDDEN: {
    vi: "Chỉ quản trị viên được đổi trọng số.",
    en: "Only an administrator can change the weights.",
  },
};

/**
 * Trọng số ghép ba phần của bài đo trình độ, theo mục đích học. Đổi trọng số là
 * thêm một dòng mới có hiệu lực từ bây giờ: bài đo đã xong giữ nguyên trọng số
 * đã dùng, nên trình độ đã ghi không bị tính lại.
 */
export function AdminLevelCheckWeightsView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error, refetch } = useAdminLevelCheckWeightsQuery({
    fetchPolicy: "network-only",
  });
  const [save, saveState] = useSetLevelCheckWeightMutation();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const weights = data?.levelCheckWeights;
  const defaultRow =
    weights?.purposes.find((purpose) => purpose.purposeCode === "DEFAULT")
      ?.inForce ?? null;

  function labelOf(purpose: Purpose) {
    return purpose.purposeCode === "DEFAULT"
      ? tr("Mặc định", "Default")
      : (purpose.displayName ?? purpose.purposeCode);
  }

  function openEditor(purpose: Purpose) {
    const base = purpose.inForce ?? defaultRow;
    setSaveError(null);
    setDraft({
      purposeCode: purpose.purposeCode,
      label: labelOf(purpose),
      vocabulary: base?.vocabulary ?? 40,
      listening: base?.listening ?? 30,
      speaking: base?.speaking ?? 30,
      priority: purpose.inForce?.priority ?? base?.priority ?? 0,
    });
  }

  async function handleSave() {
    if (!draft) return;
    const problem = problemWith(draft, isVi);
    if (problem) {
      setSaveError(problem);
      return;
    }
    setSaveError(null);
    try {
      await save({
        variables: {
          input: {
            purposeCode: draft.purposeCode,
            vocabulary: draft.vocabulary,
            listening: draft.listening,
            speaking: draft.speaking,
            priority: draft.priority,
          },
        },
      });
      await refetch();
      notifications.show({
        color: "teal",
        message: tr(
          `Đã lưu trọng số cho "${draft.label}". Áp dụng cho các bài đo hoàn tất từ bây giờ.`,
          `Saved the weights for "${draft.label}". They apply to checks completed from now on.`,
        ),
      });
      setDraft(null);
    } catch (failure) {
      const code = backendCodeOf(failure);
      const words = code ? ERROR_MESSAGES[code] : undefined;
      setSaveError(
        words
          ? isVi
            ? words.vi
            : words.en
          : tr(
              "Không lưu được. Vui lòng thử lại.",
              "Could not save. Try again.",
            ),
      );
    }
  }

  function when(value: string) {
    return new Date(value).toLocaleString(isVi ? "vi-VN" : "en-GB");
  }

  function purposeName(code: string) {
    const purpose = weights?.purposes.find((p) => p.purposeCode === code);
    return purpose ? labelOf(purpose) : code;
  }

  const total = draft ? draft.vocabulary + draft.listening + draft.speaking : 0;

  return (
    <Page>
      <PageHeader
        title={tr("Trọng số bài đo trình độ", "Level-check weights")}
      />
      <Stack gap="lg">
        <Text c="dimmed" maw={760}>
          {tr(
            "Trình độ của người học là trung bình có trọng số của ba phần (từ vựng và ngữ pháp, nghe, nói), làm tròn xuống. Người học có nhiều mục đích thì dùng mục đích có ưu tiên cao nhất; mục đích chưa đặt riêng thì dùng trọng số mặc định. Thay đổi áp dụng cho các bài đo hoàn tất từ lúc lưu; trình độ đã ghi không bị tính lại.",
            "A learner's level is the weighted mean of three parts (vocabulary and grammar, listening, speaking), rounded down. Learners with several purposes use the one with the highest priority; a purpose without its own weights uses the default. Changes apply to checks completed after saving; levels already recorded are not recalculated.",
          )}
        </Text>

        {loading && !data ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : error && !data ? (
          <Alert color="warn" radius="md">
            {tr("Không tải được trọng số.", "Could not load the weights.")}
            <Button
              variant="light"
              ml="sm"
              onClick={() => void refetch().catch(() => {})}
            >
              {tr("Thử lại", "Retry")}
            </Button>
          </Alert>
        ) : (
          weights && (
            <>
              <Paper withBorder radius="md" p={0}>
                <Table.ScrollContainer minWidth={680}>
                  <Table verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>
                          {tr("Mục đích học", "Learning purpose")}
                        </Table.Th>
                        <Table.Th ta="right">
                          {tr("Từ vựng & ngữ pháp", "Vocabulary & grammar")}
                        </Table.Th>
                        <Table.Th ta="right">
                          {tr("Nghe", "Listening")}
                        </Table.Th>
                        <Table.Th ta="right">{tr("Nói", "Speaking")}</Table.Th>
                        <Table.Th ta="right">
                          {tr("Ưu tiên", "Priority")}
                        </Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {weights.purposes.map((purpose) => {
                        const row = purpose.inForce ?? defaultRow;
                        const own = purpose.inForce != null;
                        return (
                          <Table.Tr key={purpose.purposeCode}>
                            <Table.Td>
                              <Group gap="xs">
                                <Text size="sm" fw={600}>
                                  {labelOf(purpose)}
                                </Text>
                                {!own && (
                                  <Badge variant="light" color="gray" size="sm">
                                    {tr("theo mặc định", "uses default")}
                                  </Badge>
                                )}
                              </Group>
                            </Table.Td>
                            <Table.Td ta="right">
                              {row?.vocabulary ?? "-"}%
                            </Table.Td>
                            <Table.Td ta="right">
                              {row?.listening ?? "-"}%
                            </Table.Td>
                            <Table.Td ta="right">
                              {row?.speaking ?? "-"}%
                            </Table.Td>
                            <Table.Td ta="right">
                              {own ? purpose.inForce?.priority : "-"}
                            </Table.Td>
                            <Table.Td ta="right">
                              <Button
                                variant="light"
                                size="compact-sm"
                                onClick={() => openEditor(purpose)}
                              >
                                {tr("Sửa", "Edit")}
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Paper>

              <Stack gap="xs">
                <Title order={3} size="h4">
                  {tr("Lịch sử thay đổi", "Change history")}
                </Title>
                <Paper withBorder radius="md" p={0}>
                  <Table.ScrollContainer minWidth={680}>
                    <Table verticalSpacing="xs" horizontalSpacing="md">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>
                            {tr("Thời điểm áp dụng", "Effective from")}
                          </Table.Th>
                          <Table.Th>
                            {tr("Mục đích học", "Learning purpose")}
                          </Table.Th>
                          <Table.Th>
                            {tr(
                              "Từ vựng / Nghe / Nói",
                              "Vocabulary / Listening / Speaking",
                            )}
                          </Table.Th>
                          <Table.Th ta="right">
                            {tr("Ưu tiên", "Priority")}
                          </Table.Th>
                          <Table.Th>{tr("Người đổi", "Changed by")}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {weights.history.map((change: Change) => (
                          <Table.Tr key={change.id}>
                            <Table.Td>{when(change.effectiveFrom)}</Table.Td>
                            <Table.Td>
                              {purposeName(change.purposeCode)}
                            </Table.Td>
                            <Table.Td>
                              {change.vocabulary} / {change.listening} /{" "}
                              {change.speaking}
                            </Table.Td>
                            <Table.Td ta="right">{change.priority}</Table.Td>
                            <Table.Td>
                              {change.changedBy ??
                                tr("Giá trị khởi tạo", "Initial value")}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Paper>
              </Stack>
            </>
          )
        )}
      </Stack>

      <Modal
        opened={draft != null}
        onClose={() => !saveState.loading && setDraft(null)}
        title={draft ? `${tr("Trọng số", "Weights")}: ${draft.label}` : ""}
        centered
      >
        {draft && (
          <Stack gap="md">
            <SimpleGrid cols={3}>
              <NumberInput
                label={tr("Từ vựng & ngữ pháp", "Vocabulary & grammar")}
                min={0}
                max={100}
                suffix="%"
                allowDecimal={false}
                value={draft.vocabulary}
                onChange={(v) =>
                  setDraft({ ...draft, vocabulary: Number(v) || 0 })
                }
              />
              <NumberInput
                label={tr("Nghe", "Listening")}
                min={0}
                max={100}
                suffix="%"
                allowDecimal={false}
                value={draft.listening}
                onChange={(v) =>
                  setDraft({ ...draft, listening: Number(v) || 0 })
                }
              />
              <NumberInput
                label={tr("Nói", "Speaking")}
                min={0}
                max={100}
                suffix="%"
                allowDecimal={false}
                value={draft.speaking}
                onChange={(v) =>
                  setDraft({ ...draft, speaking: Number(v) || 0 })
                }
              />
            </SimpleGrid>
            <Text size="sm" c={total === 100 ? "teal.7" : "warn.6"}>
              {tr("Tổng", "Total")}: {total}%
            </Text>
            {draft.purposeCode !== "DEFAULT" && (
              <NumberInput
                label={tr("Ưu tiên", "Priority")}
                description={tr(
                  "Người học có nhiều mục đích dùng mục đích có ưu tiên cao nhất.",
                  "Learners with several purposes use the one with the highest priority.",
                )}
                min={0}
                max={100}
                allowDecimal={false}
                value={draft.priority}
                onChange={(v) =>
                  setDraft({ ...draft, priority: Number(v) || 0 })
                }
              />
            )}
            {saveError && (
              <Alert color="warn" radius="md">
                {saveError}
              </Alert>
            )}
            <Group justify="flex-end">
              <Button
                variant="default"
                disabled={saveState.loading}
                onClick={() => setDraft(null)}
              >
                {tr("Huỷ", "Cancel")}
              </Button>
              <Button
                color="orange"
                loading={saveState.loading}
                onClick={() => void handleSave()}
              >
                {tr("Lưu, áp dụng từ bây giờ", "Save, apply from now")}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}
