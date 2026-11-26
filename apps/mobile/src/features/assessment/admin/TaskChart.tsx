import { useState } from "react";
import { Image, View } from "react-native";

import { AuthoringError, authoringRequest } from "@/lib/authoring";
import { useAssessmentRemoveTaskImageMutation } from "@/lib/graphql/generated";
import { pickImage } from "@/lib/pickImage";
import { AppText, Button, Notice, Row } from "@/ui/components";
import { radius, spacing } from "@/ui/theme";

/** The BFF's upload limit for authoring media. */
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);

export type TaskImageChange = { version: number; imageUrl?: string | null };

/**
 * The chart a Writing Task 1 learner describes. Attached straight to the saved
 * task, so each change moves the task's version on; the editor keeps the new
 * version for its next save. As the web's AssessmentTaskImage.
 */
export function TaskChart({
  taskId,
  imageUrl,
  disabled,
  onChange,
}: {
  taskId: string;
  imageUrl?: string | null;
  disabled?: boolean;
  onChange: (change: TaskImageChange) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remove] = useAssessmentRemoveTaskImageMutation();
  const failed =
    "Chưa cập nhật được ảnh. Chỉ đổi được ảnh khi đề còn là bản nháp hoặc bị từ chối.";

  async function upload() {
    setError(null);
    const picked = await pickImage({ maxBytes: MAX_IMAGE_BYTES });
    if (!picked) return;
    if ("error" in picked) {
      setError(picked.error);
      return;
    }
    if (!IMAGE_TYPES.has(picked.contentType)) {
      setError("Chọn ảnh PNG hoặc JPEG không quá 12 MB.");
      return;
    }
    setBusy(true);
    try {
      const task = await authoringRequest<TaskImageChange>(
        `ASSESSMENT_TASK/${taskId}/media`,
        "POST",
        { contentType: picked.contentType, bytes: picked.bytes },
      );
      onChange({ version: task.version, imageUrl: task.imageUrl ?? null });
    } catch (cause) {
      setError(
        cause instanceof AuthoringError &&
          cause.code === "TASK_IMAGE_TYPE_NOT_SUPPORTED"
          ? "Chỉ nhận ảnh PNG hoặc JPEG."
          : failed,
      );
    } finally {
      setBusy(false);
    }
  }

  async function drop() {
    setBusy(true);
    setError(null);
    try {
      const result = await remove({ variables: { id: taskId } });
      const task = result.data?.removeAssessmentTaskImage;
      if (!task) throw new Error("No result");
      onChange({ version: task.version, imageUrl: task.imageUrl ?? null });
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ marginBottom: spacing.md }}>
      <AppText variant="label">Biểu đồ của Task 1</AppText>
      <AppText variant="caption" tone="muted">
        Ảnh người học sẽ mô tả. Ghi lại số liệu của biểu đồ trong &quot;Ghi chú
        chấm bài&quot; để bộ chấm đối chiếu.
      </AppText>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          resizeMode="contain"
          accessibilityLabel="Biểu đồ của đề"
          style={{
            width: "100%",
            aspectRatio: 4 / 3,
            borderRadius: radius.md,
            marginVertical: spacing.sm,
          }}
        />
      ) : null}
      <Row wrap gap={spacing.xs} style={{ marginTop: spacing.xs }}>
        <Button
          title={imageUrl ? "Đổi ảnh" : "Tải ảnh biểu đồ"}
          icon="image-outline"
          size="sm"
          variant="secondary"
          loading={busy}
          disabled={disabled}
          onPress={() => void upload()}
        />
        {imageUrl ? (
          <Button
            title="Gỡ ảnh"
            icon="trash-outline"
            size="sm"
            variant="ghost"
            disabled={disabled || busy}
            onPress={() => void drop()}
          />
        ) : null}
      </Row>
      <Notice message={error} />
    </View>
  );
}
