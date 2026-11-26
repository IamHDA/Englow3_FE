import { fetch } from "expo/fetch";

/**
 * PUTs a file to a pre-signed storage URL the BFF handed out. The content type
 * must be the one the URL was signed for, or storage refuses the upload.
 */
export async function uploadToSignedUrl(
  url: string,
  contentType: string,
  bytes: Uint8Array,
) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    // A standalone ArrayBuffer: the view may sit inside a larger buffer.
    body: bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  });
  if (!response.ok) throw new Error(`Upload failed with ${response.status}`);
}
