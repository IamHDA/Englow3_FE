import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useState } from "react";
import { Image, View } from "react-native";

import { audioDurationSeconds } from "@/lib/audioDuration";
import { authoringRequest } from "@/lib/authoring";
import { pickImage } from "@/lib/pickImage";
import { ClipPlayer } from "@/ui/audio";
import { AppText, Button, Notice } from "@/ui/components";
import { radius, spacing } from "@/ui/theme";

/** The BFF's upload limit for authoring media. */
const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);
/** A content id for media uploaded before the item is first saved. */
const UNSAVED_ID = "00000000-0000-0000-0000-000000000000";

export type MediaKind = "EXAM" | "DICTATION_LESSON" | "FLASHCARD_SET";

function audioType(name: string, mimeType?: string | null) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  return mimeType === "audio/wav" || mimeType === "audio/x-wav"
    ? "audio/wav"
    : mimeType === "audio/mpeg" || mimeType === "audio/mp3"
      ? "audio/mpeg"
      : null;
}

/**
 * One audio (MP3/WAV) or image (PNG/JPEG) for a piece of content: uploads it
 * and hands back the storage key, as the web's AuthoringMedia. An exam's
 * media needs the exam saved first, since it is stored under the exam.
 */
export function MediaUpload({
  kind,
  id,
  label,
  image = false,
  url,
  disabled = false,
  onUploaded,
  onBusyChange,
}: {
  kind: MediaKind;
  id?: string;
  label?: string;
  image?: boolean;
  url?: string | null;
  disabled?: boolean;
  onUploaded: (key: string, url: string, seconds?: number) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsId = kind === "EXAM" && !id;

  async function choose(): Promise<{
    contentType: string;
    bytes: Uint8Array;
    uri: string;
  } | null> {
    if (image) {
      const picked = await pickImage({ maxBytes: MAX_BYTES });
      if (!picked) return null;
      if ("error" in picked) throw new Error(picked.error);
      if (!IMAGE_TYPES.has(picked.contentType))
        throw new Error("Chọn ảnh PNG hoặc JPEG.");
      return picked;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) return null;
    const contentType = audioType(asset.name, asset.mimeType);
    if (!contentType) throw new Error("Chọn file MP3 hoặc WAV.");
    if (asset.size != null && asset.size > MAX_BYTES)
      throw new Error("File tối đa 12 MB.");
    const bytes = await new File(asset.uri).bytes();
    if (bytes.byteLength > MAX_BYTES) throw new Error("File tối đa 12 MB.");
    return { contentType, bytes, uri: asset.uri };
  }

  async function upload() {
    setError(null);
    let file;
    try {
      file = await choose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không mở được file.");
      return;
    }
    if (!file) return;
    setBusy(true);
    onBusyChange?.(true);
    try {
      const seconds = image
        ? undefined
        : await audioDurationSeconds(file.uri, file.bytes);
      const result = await authoringRequest<{
        objectKey: string;
        url?: string;
        mediaUrl?: string;
      }>(`${kind}/${id ?? UNSAVED_ID}/media`, "POST", {
        contentType: file.contentType,
        bytes: file.bytes,
      });
      onUploaded(
        result.objectKey,
        result.url ?? result.mediaUrl ?? "",
        seconds,
      );
    } catch {
      setError(
        "Không tải được file. Chọn đúng định dạng, tối đa 12 MB, rồi thử lại.",
      );
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Button
        title={label ?? (image ? "Tải ảnh" : "Tải audio")}
        icon={image ? "image-outline" : "musical-notes-outline"}
        size="sm"
        variant="secondary"
        loading={busy}
        disabled={disabled || needsId}
        onPress={() => void upload()}
      />
      {needsId ? (
        <AppText variant="caption" tone="muted">
          Lưu nháp đề trước khi thêm media.
        </AppText>
      ) : null}
      {url ? (
        image ? (
          <Image
            source={{ uri: url }}
            resizeMode="contain"
            accessibilityLabel="Ảnh trong đề"
            style={{
              width: "100%",
              aspectRatio: 4 / 3,
              borderRadius: radius.md,
              marginTop: spacing.xs,
            }}
          />
        ) : (
          <View style={{ marginTop: spacing.xs }}>
            <ClipPlayer url={url} />
          </View>
        )
      ) : null}
      <Notice message={error} />
    </View>
  );
}
