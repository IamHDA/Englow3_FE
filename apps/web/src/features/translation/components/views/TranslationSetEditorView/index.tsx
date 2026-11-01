"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  authoringRequest,
  AuthoringError,
} from "@/features/content/api/authoring";
import { AuthoringReviewActions } from "@/features/content/components/blocks/AuthoringReviewActions";
import { EditorFrame } from "@/shared/components/EditorFrame";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  parsePasted,
  slugify,
  type AuthoringItem as Item,
} from "../../../authoring";

type Metadata = {
  slug: string;
  title: string;
  topic: string;
  targetLevel?: string | null;
  description?: string | null;
};
type Document = {
  id: string;
  version: number;
  status: string;
  reviewNote?: string | null;
  metadata: Metadata;
  items: Item[];
};

const KIND = "TRANSLATION_SET";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const EMPTY_ITEM: Item = { sourceVi: "", referenceEn: "", notes: "" };

const ERRORS: Record<string, { vi: string; en: string }> = {
  CONTENT_SLUG_TAKEN: {
    vi: "Slug này đã được dùng.",
    en: "This slug is already used.",
  },
  CONTENT_CHANGED: {
    vi: "Bộ câu vừa được người khác sửa. Tải lại trang rồi lưu lại.",
    en: "Someone else changed this set. Reload and save again.",
  },
  CONTENT_NOT_EDITABLE: {
    vi: "Chỉ sửa được bộ câu chưa từng xuất bản.",
    en: "Only a set that was never published can be edited.",
  },
  VALIDATION_FAILED: {
    vi: "Còn trường bắt buộc chưa điền hoặc quá dài.",
    en: "A required field is empty or too long.",
  },
  UNAUTHENTICATED: {
    vi: "Phiên đăng nhập đã hết. Đăng nhập lại.",
    en: "Your session ended. Sign in again.",
  },
};

export function TranslationSetEditorView({ id }: { id?: string }) {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const router = useRouter();
  const back = `/admin/content?kind=${KIND}`;

  const [doc, setDoc] = useState<Document | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    slug: "",
    title: "",
    topic: "",
    targetLevel: null,
  });
  const [items, setItems] = useState<Item[]>([{ ...EMPTY_ITEM }]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [paste, setPaste] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Bumped to load again after a review action changes the status.
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    authoringRequest<Document>(`${KIND}/${id}`)
      .then((loaded) => {
        if (!active) return;
        setDoc(loaded);
        setMetadata(loaded.metadata);
        setItems(loaded.items.length > 0 ? loaded.items : [{ ...EMPTY_ITEM }]);
        setSlugTouched(true);
        setDirty(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [id, reload]);

  const editable = !doc || doc.status === "DRAFT" || doc.status === "REJECTED";

  function updateMeta(patch: Partial<Metadata>) {
    setMetadata((prev) => {
      const next = { ...prev, ...patch };
      if (patch.title !== undefined && !slugTouched)
        next.slug = slugify(patch.title);
      return next;
    });
    setDirty(true);
  }

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
    setDirty(true);
  }

  function move(index: number, by: number) {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(index + by, 0, moved);
      return next;
    });
    setDirty(true);
  }

  async function save() {
    setSaveError(null);
    const filled = items.filter(
      (item) => item.sourceVi.trim() || item.referenceEn.trim(),
    );
    if (
      !metadata.title.trim() ||
      !metadata.slug.trim() ||
      !metadata.topic.trim()
    ) {
      setSaveError(
        t(
          "Cần nhập tiêu đề, slug và chủ đề.",
          "Title, slug and topic are required.",
        ),
      );
      return;
    }
    if (
      filled.some((item) => !item.sourceVi.trim() || !item.referenceEn.trim())
    ) {
      setSaveError(
        t(
          "Mỗi câu cần cả câu tiếng Việt và bản dịch mẫu.",
          "Each sentence needs both the Vietnamese and a model translation.",
        ),
      );
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
      const saved = doc
        ? await authoringRequest<Document>(`${KIND}/${doc.id}`, "PUT", body)
        : await authoringRequest<Document>(KIND, "POST", body);
      notifications.show({
        color: "teal",
        message: t("Đã lưu bộ câu.", "Set saved."),
      });
      if (!doc) {
        router.replace(`/admin/content/editor/${KIND}/${saved.id}`);
        return;
      }
      setDoc(saved);
      setItems(saved.items.length > 0 ? saved.items : [{ ...EMPTY_ITEM }]);
      setDirty(false);
    } catch (error) {
      const code = error instanceof AuthoringError ? error.code : "";
      const known = ERRORS[code];
      setSaveError(
        known
          ? isVi
            ? known.vi
            : known.en
          : t("Lưu không thành công. Thử lại.", "Could not save. Try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <EditorFrame
        standalone
        title={t("Bộ câu luyện dịch", "Translation set")}
        busy={false}
        onClose={() => router.push(back)}
      >
        <Alert color="red">
          {t("Không tải được bộ câu.", "Could not load the set.")}
        </Alert>
      </EditorFrame>
    );
  }
  if (id && !doc) {
    return (
      <EditorFrame
        standalone
        title={t("Bộ câu luyện dịch", "Translation set")}
        busy={false}
        onClose={() => router.push(back)}
      >
        <Loader />
      </EditorFrame>
    );
  }

  return (
    <EditorFrame
      standalone
      title={`${!editable ? t("Xem", "View") : doc ? t("Sửa", "Edit") : t("Tạo", "Create")} · ${t("Bộ câu luyện dịch", "Translation set")}`}
      busy={busy}
      onClose={() => {
        if (
          !dirty ||
          window.confirm(
            t("Bỏ các thay đổi chưa lưu?", "Discard unsaved changes?"),
          )
        )
          router.push(back);
      }}
    >
      <Stack gap="lg">
        {doc && (
          <Group gap="xs">
            <Badge variant="light">{doc.status}</Badge>
            {!editable && (
              <Text size="sm" c="dimmed">
                {t(
                  "Bộ câu đã gửi duyệt hoặc đã xuất bản nên không sửa được nữa.",
                  "This set is in review or published, so it can no longer be edited.",
                )}
              </Text>
            )}
          </Group>
        )}
        {doc?.status === "REJECTED" && doc.reviewNote && (
          <Alert
            color="orange"
            title={t("Lý do bị trả lại", "Why it came back")}
          >
            {doc.reviewNote}
          </Alert>
        )}

        <Card withBorder>
          <Stack>
            <Group grow align="flex-start">
              <TextInput
                required
                label={t("Tiêu đề", "Title")}
                value={metadata.title}
                maxLength={200}
                disabled={!editable}
                onChange={(event) =>
                  updateMeta({ title: event.currentTarget.value })
                }
              />
              <TextInput
                required
                label="Slug"
                value={metadata.slug}
                maxLength={120}
                disabled={!editable}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateMeta({ slug: event.currentTarget.value });
                }}
              />
            </Group>
            <Group grow align="flex-start">
              <TextInput
                required
                label={t("Chủ đề", "Topic")}
                placeholder={t(
                  "vd: daily-life, travel, work",
                  "e.g. daily-life, travel, work",
                )}
                value={metadata.topic}
                maxLength={60}
                disabled={!editable}
                onChange={(event) =>
                  updateMeta({ topic: event.currentTarget.value })
                }
              />
              <Select
                label={t("Trình độ", "Level")}
                data={LEVELS}
                clearable
                value={metadata.targetLevel ?? null}
                disabled={!editable}
                onChange={(value) => updateMeta({ targetLevel: value })}
              />
            </Group>
            <Textarea
              label={t("Mô tả", "Description")}
              autosize
              minRows={2}
              maxLength={2000}
              value={metadata.description ?? ""}
              disabled={!editable}
              onChange={(event) =>
                updateMeta({ description: event.currentTarget.value })
              }
            />
          </Stack>
        </Card>

        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={3}>
              {t("Các câu", "Sentences")} ({items.length})
            </Title>
          </Group>
          {items.map((item, index) => (
            <Card key={index} withBorder padding="sm">
              <Group align="flex-start" wrap="nowrap" gap="sm">
                <Badge variant="light" mt={28}>
                  {index + 1}
                </Badge>
                <Stack gap="xs" flex={1}>
                  <Textarea
                    label={t("Câu tiếng Việt", "Vietnamese sentence")}
                    autosize
                    minRows={1}
                    maxLength={1000}
                    lang="vi"
                    value={item.sourceVi}
                    disabled={!editable}
                    onChange={(event) =>
                      updateItem(index, { sourceVi: event.currentTarget.value })
                    }
                  />
                  <Textarea
                    label={t(
                      "Bản dịch mẫu (tiếng Anh)",
                      "Model translation (English)",
                    )}
                    autosize
                    minRows={1}
                    maxLength={1000}
                    lang="en"
                    value={item.referenceEn}
                    disabled={!editable}
                    onChange={(event) =>
                      updateItem(index, {
                        referenceEn: event.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    label={t(
                      "Ghi chú cho học viên (tuỳ chọn)",
                      "Note for learners (optional)",
                    )}
                    maxLength={2000}
                    value={item.notes ?? ""}
                    disabled={!editable}
                    onChange={(event) =>
                      updateItem(index, { notes: event.currentTarget.value })
                    }
                  />
                </Stack>
                {editable && (
                  <Stack gap={4} mt={28}>
                    <ActionIcon
                      variant="subtle"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={t("Lên trên", "Move up")}
                    >
                      <ArrowUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={t("Xuống dưới", "Move down")}
                    >
                      <ArrowDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      disabled={items.length === 1}
                      onClick={() => {
                        setItems((prev) => prev.filter((_, i) => i !== index));
                        setDirty(true);
                      }}
                      aria-label={t("Xoá câu", "Delete sentence")}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Stack>
                )}
              </Group>
            </Card>
          ))}
          {editable && (
            <Group>
              <Button
                variant="light"
                leftSection={<Plus size={16} />}
                disabled={items.length >= 200}
                onClick={() => {
                  setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
                  setDirty(true);
                }}
              >
                {t("Thêm câu", "Add sentence")}
              </Button>
            </Group>
          )}
        </Stack>

        {editable && (
          <Card withBorder>
            <Stack gap="xs">
              <Text fw={600}>
                {t("Dán nhanh nhiều câu", "Paste many sentences")}
              </Text>
              <Text size="sm" c="dimmed">
                {t(
                  "Mỗi dòng một câu: câu tiếng Việt | bản dịch tiếng Anh | ghi chú (tuỳ chọn). Có thể dán thẳng từ Excel.",
                  "One per line: Vietnamese | English | note (optional). Pasting from a spreadsheet works too.",
                )}
              </Text>
              <Textarea
                autosize
                minRows={3}
                placeholder={
                  "Tôi đã sống ở đây ba năm. | I have lived here for three years."
                }
                value={paste}
                onChange={(event) => setPaste(event.currentTarget.value)}
              />
              <Group>
                <Button
                  variant="light"
                  disabled={!paste.trim()}
                  onClick={() => {
                    const parsed = parsePasted(paste);
                    if (parsed.length === 0) {
                      notifications.show({
                        color: "orange",
                        message: t(
                          "Không đọc được dòng nào.",
                          "No line could be read.",
                        ),
                      });
                      return;
                    }
                    setItems((prev) =>
                      [
                        ...prev.filter(
                          (item) =>
                            item.sourceVi.trim() || item.referenceEn.trim(),
                        ),
                        ...parsed,
                      ].slice(0, 200),
                    );
                    setPaste("");
                    setDirty(true);
                  }}
                >
                  {t("Thêm vào danh sách", "Add to the list")}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {saveError && <Alert color="red">{saveError}</Alert>}

        {editable && (
          <Group justify="flex-end">
            <Button color="orange" loading={busy} onClick={() => void save()}>
              {t("Lưu bản nháp", "Save draft")}
            </Button>
          </Group>
        )}

        {doc && (
          <AuthoringReviewActions
            key={doc.status}
            kind={KIND}
            id={doc.id}
            status={doc.status}
            dirty={dirty}
            refresh={async () => setReload((n) => n + 1)}
          />
        )}
      </Stack>
    </EditorFrame>
  );
}
