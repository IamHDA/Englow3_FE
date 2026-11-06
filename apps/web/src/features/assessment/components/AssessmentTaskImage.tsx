"use client";
import {
  Alert,
  Button,
  FileButton,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { authoringRequest } from "@/features/content";
import { useAssessmentRemoveTaskImageMutation } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

/** The BFF's upload limit for authoring media. */
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg"];

/** What an upload or a removal changes on the task the editor holds. */
export type TaskImageChange = { version: number; imageUrl?: string | null };

/**
 * The chart a Writing Task 1 learner describes. Attached straight to the saved
 * task, so each change moves the task's version on; the editor keeps the new
 * version for its next save.
 */
export function AssessmentTaskImage({
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
  const { isVi } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remove] = useAssessmentRemoveTaskImageMutation();
  const failed = isVi
    ? "Chưa cập nhật được ảnh. Chỉ đổi được ảnh khi đề còn là bản nháp hoặc bị từ chối."
    : "The chart was not updated. It can only change while the task is a draft or rejected.";

  async function upload(file: File | null) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setError(
        isVi
          ? "Chọn ảnh PNG hoặc JPEG không quá 12 MB."
          : "Choose a PNG or JPEG of at most 12 MB.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const task = await authoringRequest<TaskImageChange>(
        `ASSESSMENT_TASK/${taskId}/media`,
        "POST",
        file,
      );
      onChange({ version: task.version, imageUrl: task.imageUrl ?? null });
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  async function drop() {
    setBusy(true);
    setError(null);
    try {
      const r = await remove({ variables: { id: taskId } });
      const task = r.data?.removeAssessmentTaskImage;
      if (!task) throw new Error("No result");
      onChange({ version: task.version, imageUrl: task.imageUrl ?? null });
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {isVi ? "Biểu đồ của Task 1" : "Task 1 chart"}
      </Text>
      <Text size="xs" c="dimmed">
        {isVi
          ? 'Ảnh người học sẽ mô tả. Ghi lại số liệu của biểu đồ trong "Ghi chú chấm bài" để bộ chấm đối chiếu.'
          : "The picture learners describe. Copy its figures into the grading notes so the grader can check them."}
      </Text>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={isVi ? "Biểu đồ của đề" : "Task chart"}
          fit="contain"
          mah={320}
          radius="sm"
        />
      )}
      <Group>
        <FileButton
          accept={IMAGE_TYPES.join(",")}
          onChange={(f) => void upload(f)}
        >
          {(props) => (
            <Button
              {...props}
              variant="light"
              leftSection={<ImagePlus size={16} />}
              loading={busy}
              disabled={disabled}
            >
              {imageUrl
                ? isVi
                  ? "Thay ảnh"
                  : "Replace chart"
                : isVi
                  ? "Tải ảnh biểu đồ"
                  : "Upload chart"}
            </Button>
          )}
        </FileButton>
        {imageUrl && (
          <Button
            variant="subtle"
            color="red"
            leftSection={<Trash2 size={16} />}
            disabled={disabled || busy}
            onClick={() => void drop()}
          >
            {isVi ? "Xóa ảnh" : "Remove chart"}
          </Button>
        )}
      </Group>
      {error && <Alert color="red">{error}</Alert>}
    </Stack>
  );
}
