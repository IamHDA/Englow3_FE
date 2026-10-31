"use client";
import { Alert, FileButton, Button, Image, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { authoringRequest } from "../../api/authoring";
export function AuthoringMedia({
  kind,
  id,
  label,
  onUploaded,
  url,
  image = false,
  disabled = false,
  onBusyChange,
}: {
  kind: "EXAM" | "DICTATION_LESSON" | "FLASHCARD_SET";
  id?: string;
  label?: string;
  onUploaded: (key: string, url: string, seconds?: number) => void;
  url?: string;
  image?: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { isVi } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function upload(file: File | null) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setError(true);
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    setError(false);
    try {
      let seconds: number | undefined;
      if (!image) {
        const temp = URL.createObjectURL(file);
        try {
          seconds = await new Promise<number>((resolve, reject) => {
            const audio = new Audio(temp);
            const timer = setTimeout(() => {
              audio.src = "";
              reject(new Error("Audio timeout"));
            }, 10000);
            audio.onloadedmetadata = () => {
              clearTimeout(timer);
              const duration = audio.duration;
              audio.src = "";
              if (Number.isFinite(duration) && duration > 0)
                resolve(Math.ceil(duration));
              else reject(new Error("Invalid duration"));
            };
            audio.onerror = () => {
              clearTimeout(timer);
              audio.src = "";
              reject(new Error("Audio invalid"));
            };
          });
        } finally {
          URL.revokeObjectURL(temp);
        }
      }
      const result = await authoringRequest<{
        objectKey: string;
        url?: string;
        mediaUrl?: string;
      }>(
        `${kind}/${id ?? "00000000-0000-0000-0000-000000000000"}/media`,
        "POST",
        file,
      );
      onUploaded(
        result.objectKey,
        result.url ?? result.mediaUrl ?? "",
        seconds,
      );
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  return (
    <Stack gap="xs">
      <FileButton
        onChange={upload}
        accept={
          image ? "image/png,image/jpeg" : "audio/mpeg,audio/wav,.mp3,.wav"
        }
      >
        {(props) => (
          <Button
            {...props}
            variant="light"
            loading={busy}
            disabled={disabled || (kind === "EXAM" && !id)}
          >
            {label ??
              (isVi
                ? image
                  ? "Tải ảnh"
                  : "Tải audio"
                : "Upload " + (image ? "image" : "audio"))}
          </Button>
        )}
      </FileButton>
      {kind === "EXAM" && !id && (
        <Text size="sm" c="dimmed">
          {isVi
            ? "Lưu nháp đề trước khi thêm media."
            : "Save the draft before adding media."}
        </Text>
      )}
      {url &&
        (image ? (
          <Image
            src={url}
            alt={isVi ? "Ảnh trong đề" : "Question image"}
            fit="contain"
            mah={320}
          />
        ) : (
          <audio controls src={url} style={{ width: "100%" }} />
        ))}
      {error && (
        <Alert color="orange">
          {isVi
            ? "Không tải được file. Chọn đúng định dạng, tối đa 12 MB, rồi thử lại."
            : "Upload failed. Choose a supported file under 12 MB and retry."}
        </Alert>
      )}
    </Stack>
  );
}
