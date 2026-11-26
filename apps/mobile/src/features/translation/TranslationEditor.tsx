import { Stack, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { ReviewActions } from "@/features/content/ReviewActions";
import { AuthoringError, authoringRequest } from "@/lib/authoring";
import { useRest } from "@/lib/useRest";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  ErrorState,
  LoadingState,
  Notice,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { spacing } from "@/ui/theme";

import { parsePasted, slugify, type AuthoringItem as Item } from "./authoring";

type Metadata = {
  slug: string;
  title: string;
  topic: string;
  targetLevel?: string | null;
  description?: string | null;
};

type TranslationDocument = {
  id: string;
  version: number;
  status: string;
  reviewNote?: string | null;
  metadata: Metadata;
  items: Item[];
};

const KIND = "TRANSLATION_SET";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MAX_ITEMS = 200;
const EMPTY_ITEM: Item = { sourceVi: "", referenceEn: "", notes: "" };

const ERRORS: Record<string, string> = {
  CONTENT_SLUG_TAKEN: "Slug này đã được dùng.",
  CONTENT_CHANGED: "Bộ câu vừa được người khác sửa. Mở lại rồi lưu lại.",
  CONTENT_NOT_EDITABLE: "Chỉ sửa được bộ câu chưa từng xuất bản.",
  VALIDATION_FAILED: "Còn trường bắt buộc chưa điền hoặc quá dài.",
  UNAUTHENTICATED: "Phiên đăng nhập đã hết. Đăng nhập lại.",
};

/** Vietnamese sentences with model translations. As the web's TranslationSetEditorView. */
export function TranslationEditor({ id }: { id: string }) {
  const creating = id === "new";
  const loaded = useRest(`${KIND}/${id}`, () =>
    creating
      ? Promise.resolve(null)
      : authoringRequest<TranslationDocument>(`${KIND}/${id}`),
  );

  if (loaded.error)
    return (
      <Screen>
        <Stack.Screen options={{ title: "Bộ câu luyện dịch" }} />
        <ErrorState message="Không tải được bộ câu." onRetry={loaded.reload} />
      </Screen>
    );
  if (loaded.loading)
    return (
      <Screen>
        <Stack.Screen options={{ title: "Bộ câu luyện dịch" }} />
        <LoadingState />
      </Screen>
    );
  const doc = loaded.data ?? null;
  return (
    <Form
      key={doc ? `${doc.version}:${doc.status}` : "new"}
      doc={doc}
      saved={(next) => loaded.setData(next)}
      reload={loaded.reload}
    />
  );
}

function Form({
  doc,
  saved,
  reload,
}: {
  doc: TranslationDocument | null;
  saved: (doc: TranslationDocument) => void;
  reload: () => void;
}) {
  const [metadata, setMetadata] = useState<Metadata>(
    doc?.metadata ?? { slug: "", title: "", topic: "", targetLevel: null },
  );
  const [items, setItems] = useState<Item[]>(
    doc && doc.items.length > 0 ? doc.items : [{ ...EMPTY_ITEM }],
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(doc));
  const [paste, setPaste] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const editable = !doc || doc.status === "DRAFT" || doc.status === "REJECTED";

  function updateMeta(patch: Partial<Metadata>) {
    setMetadata((previous) => {
      const next = { ...previous, ...patch };
      if (patch.title !== undefined && !slugTouched)
        next.slug = slugify(patch.title);
      return next;
    });
    setDirty(true);
    setNotice(null);
  }

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((previous) =>
      previous.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
    setDirty(true);
    setNotice(null);
  }

  function move(index: number, by: number) {
    setItems((previous) => {
      const next = [...previous];
      const [moved] = next.splice(index, 1);
      if (moved) next.splice(index + by, 0, moved);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    setError(null);
    const filled = items.filter(
      (item) => item.sourceVi.trim() || item.referenceEn.trim(),
    );
    if (
      !metadata.title.trim() ||
      !metadata.slug.trim() ||
      !metadata.topic.trim()
    ) {
      setError("Cần nhập tiêu đề, slug và chủ đề.");
      return;
    }
    if (
      filled.some((item) => !item.sourceVi.trim() || !item.referenceEn.trim())
    ) {
      setError("Mỗi câu cần cả câu tiếng Việt và bản dịch mẫu.");
      return;
    }
    setBusy(true);
    try {
      const body = {
        version: doc?.version,
        metadata: {
          ...metadata,
          targetLevel: metadata.targetLevel || null,
          description: metadata.description?.trim() || null,
        },
        items: filled.map((item) => ({
          ...item,
          notes: item.notes?.trim() || null,
        })),
      };
      const result = doc
        ? await authoringRequest<TranslationDocument>(
            `${KIND}/${doc.id}`,
            "PUT",
            body,
          )
        : await authoringRequest<TranslationDocument>(KIND, "POST", body);
      if (!doc) {
        router.replace({
          pathname: "/admin/content/editor/[kind]/[id]",
          params: { kind: KIND, id: result.id },
        });
        return;
      }
      saved(result);
    } catch (cause) {
      const code = cause instanceof AuthoringError ? cause.code : "";
      setError(ERRORS[code] ?? "Lưu không thành công. Thử lại.");
    } finally {
      setBusy(false);
    }
  }

  function addPasted() {
    const parsed = parsePasted(paste);
    if (parsed.length === 0) {
      setNotice("Không đọc được dòng nào.");
      return;
    }
    setItems((previous) =>
      [
        ...previous.filter(
          (item) => item.sourceVi.trim() || item.referenceEn.trim(),
        ),
        ...parsed,
      ].slice(0, MAX_ITEMS),
    );
    setPaste("");
    setDirty(true);
    setNotice(`Đã thêm ${parsed.length} câu.`);
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: `${!editable ? "Xem" : doc ? "Sửa" : "Tạo"} · Bộ câu luyện dịch`,
        }}
      />
      {doc ? (
        <Row gap={spacing.xs} style={{ alignItems: "center" }}>
          <Badge label={doc.status} />
          {!editable ? (
            <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
              Bộ câu đã gửi duyệt hoặc đã xuất bản nên không sửa được nữa.
            </AppText>
          ) : null}
        </Row>
      ) : null}
      {doc?.status === "REJECTED" && doc.reviewNote ? (
        <Notice message={`Lý do bị trả lại: ${doc.reviewNote}`} />
      ) : null}

      <Card style={{ marginVertical: spacing.md }}>
        <TextField
          label="Tiêu đề *"
          value={metadata.title}
          maxLength={200}
          editable={editable}
          onChangeText={(title) => updateMeta({ title })}
        />
        <TextField
          label="Slug *"
          value={metadata.slug}
          maxLength={120}
          autoCapitalize="none"
          editable={editable}
          onChangeText={(slug) => {
            setSlugTouched(true);
            updateMeta({ slug });
          }}
        />
        <TextField
          label="Chủ đề *"
          placeholder="vd: daily-life, travel, work"
          value={metadata.topic}
          maxLength={60}
          autoCapitalize="none"
          editable={editable}
          onChangeText={(topic) => updateMeta({ topic })}
        />
        <AppText variant="label">Trình độ</AppText>
        <ChipRow>
          <Chip
            label="Không đặt"
            selected={!metadata.targetLevel}
            onPress={() => editable && updateMeta({ targetLevel: null })}
          />
          {LEVELS.map((level) => (
            <Chip
              key={level}
              label={level}
              selected={metadata.targetLevel === level}
              onPress={() => editable && updateMeta({ targetLevel: level })}
            />
          ))}
        </ChipRow>
        <TextField
          label="Mô tả"
          value={metadata.description ?? ""}
          maxLength={2000}
          multiline
          editable={editable}
          onChangeText={(description) => updateMeta({ description })}
        />
      </Card>

      <AppText variant="heading" style={{ marginBottom: spacing.sm }}>
        Các câu ({items.length})
      </AppText>
      {items.map((item, index) => (
        <Card key={index} style={{ marginBottom: spacing.sm }}>
          <Row
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Badge label={String(index + 1)} />
            {editable ? (
              <Row gap={spacing.xs}>
                <Button
                  title="↑"
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  onPress={() => move(index, -1)}
                />
                <Button
                  title="↓"
                  size="sm"
                  variant="ghost"
                  disabled={index === items.length - 1}
                  onPress={() => move(index, 1)}
                />
                <Button
                  title="Xoá"
                  size="sm"
                  variant="ghost"
                  disabled={items.length === 1}
                  onPress={() => {
                    setItems((previous) =>
                      previous.filter((_, i) => i !== index),
                    );
                    setDirty(true);
                  }}
                />
              </Row>
            ) : null}
          </Row>
          <TextField
            label="Câu tiếng Việt"
            value={item.sourceVi}
            maxLength={1000}
            multiline
            editable={editable}
            onChangeText={(sourceVi) => updateItem(index, { sourceVi })}
          />
          <TextField
            label="Bản dịch mẫu (tiếng Anh)"
            value={item.referenceEn}
            maxLength={1000}
            multiline
            editable={editable}
            onChangeText={(referenceEn) => updateItem(index, { referenceEn })}
          />
          <TextField
            label="Ghi chú cho học viên (tuỳ chọn)"
            value={item.notes ?? ""}
            maxLength={2000}
            editable={editable}
            onChangeText={(notes) => updateItem(index, { notes })}
          />
        </Card>
      ))}
      {editable ? (
        <>
          <Button
            title="Thêm câu"
            icon="add"
            variant="secondary"
            disabled={items.length >= MAX_ITEMS}
            onPress={() => {
              setItems((previous) => [...previous, { ...EMPTY_ITEM }]);
              setDirty(true);
            }}
          />
          <Card style={{ marginTop: spacing.md }}>
            <AppText variant="label">Dán nhanh nhiều câu</AppText>
            <AppText variant="caption" tone="muted">
              Mỗi dòng một câu: câu tiếng Việt | bản dịch tiếng Anh | ghi chú
              (tuỳ chọn). Có thể dán thẳng từ Excel.
            </AppText>
            <TextField
              placeholder="Tôi đã sống ở đây ba năm. | I have lived here for three years."
              value={paste}
              onChangeText={setPaste}
              multiline
            />
            <Button
              title="Thêm vào danh sách"
              size="sm"
              variant="secondary"
              disabled={!paste.trim()}
              onPress={addPasted}
            />
            <Notice tone="info" message={notice} />
          </Card>
        </>
      ) : null}

      <View style={{ marginTop: spacing.lg }}>
        <Notice message={error} />
        {editable ? (
          <Button
            title="Lưu bản nháp"
            loading={busy}
            onPress={() => void save()}
          />
        ) : null}
        {doc ? (
          <ReviewActions
            key={doc.status}
            kind={KIND}
            id={doc.id}
            status={doc.status}
            dirty={dirty}
            refresh={async () => reload()}
          />
        ) : null}
      </View>
    </Screen>
  );
}
