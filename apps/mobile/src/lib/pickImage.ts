import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

export type PickedImage = {
  uri: string;
  contentType: string;
  bytes: Uint8Array;
};

const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Lets the learner choose one photo. JPEG, PNG and WebP pass as they are; any
 * other format (HEIC from an iPhone camera roll, say) is re-encoded as JPEG by
 * the picker, since the backend accepts only those three.
 */
export async function pickImage(options: {
  maxBytes: number;
  aspect?: [number, number];
}): Promise<PickedImage | { error: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted)
    return {
      error: "Englow3 cần quyền truy cập ảnh. Hãy bật trong Cài đặt của máy.",
    };
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: Boolean(options.aspect),
    aspect: options.aspect,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  const contentType =
    asset.mimeType && ACCEPTED.has(asset.mimeType)
      ? asset.mimeType
      : "image/jpeg";
  const bytes = await new File(asset.uri).bytes();
  if (bytes.byteLength > options.maxBytes) {
    return {
      error: `Ảnh quá lớn (tối đa ${Math.round(options.maxBytes / 1024 / 1024)} MB). Hãy chọn ảnh khác.`,
    };
  }
  return { uri: asset.uri, contentType, bytes };
}
