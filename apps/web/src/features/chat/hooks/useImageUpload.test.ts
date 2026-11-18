import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IMAGE_MAX_BYTES } from "../constants/chat";

import { IMAGE_PROBLEM, ImageRejected, useImageUpload } from "./useImageUpload";

const TARGET = {
  uploadId: "up-1",
  uploadUrl: "https://storage.test/chat/up-1?sig=abc",
  contentType: "image/png",
};

function fileOf(type: string, size: number) {
  return new File([new Uint8Array(size)], "photo", { type });
}

function setup() {
  const startUpload = vi.fn().mockResolvedValue(TARGET);
  const { result } = renderHook(() => useImageUpload({ startUpload }));
  return { ...result.current, startUpload };
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("checking a file before anything is asked of the backend", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts %s", (type) => {
    expect(setup().validate(fileOf(type, 10))).toBeNull();
  });

  it.each(["image/gif", "image/svg+xml", "application/pdf", ""])(
    "refuses the type %j",
    (type) => {
      expect(setup().validate(fileOf(type, 10))).toBe(IMAGE_PROBLEM.type);
    },
  );

  it("accepts a file of exactly 5 MB and refuses one byte more", () => {
    const { validate } = setup();

    expect(validate(fileOf("image/png", IMAGE_MAX_BYTES))).toBeNull();
    expect(validate(fileOf("image/png", IMAGE_MAX_BYTES + 1))).toBe(
      IMAGE_PROBLEM.size,
    );
  });

  it("refuses an empty file", () => {
    expect(setup().validate(fileOf("image/png", 0))).toBe(IMAGE_PROBLEM.empty);
  });
});

describe("uploading", () => {
  it("asks for a URL with the file's type and size, then PUTs the bytes with that type", async () => {
    const { upload, startUpload } = setup();
    const file = fileOf("image/png", 1234);

    const uploadId = await upload("c1", file);

    expect(uploadId).toBe("up-1");
    expect(startUpload).toHaveBeenCalledExactlyOnceWith({
      conversationId: "c1",
      contentType: "image/png",
      contentLength: 1234,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(TARGET.uploadUrl);
    expect(init).toMatchObject({
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: file,
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("PUTs with the type the backend signed for, whatever the file said", async () => {
    const { upload, startUpload } = setup();
    startUpload.mockResolvedValue({ ...TARGET, contentType: "image/webp" });

    await upload("c1", fileOf("image/webp", 10));

    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      "Content-Type": "image/webp",
    });
  });

  it("rejects, and returns no upload id to send a message about, when the PUT fails", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    const { upload } = setup();

    await expect(upload("c1", fileOf("image/png", 10))).rejects.toThrow(
      "Image upload failed with 403",
    );
  });

  it("rejects when the connection to storage fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { upload } = setup();

    await expect(upload("c1", fileOf("image/png", 10))).rejects.toThrow(
      "Failed to fetch",
    );
  });

  it("puts nothing when the backend would not make an upload URL", async () => {
    const { upload, startUpload } = setup();
    startUpload.mockRejectedValue(new Error("refused"));

    await expect(upload("c1", fileOf("image/png", 10))).rejects.toThrow(
      "refused",
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks for nothing at all for a file it would refuse", async () => {
    const { upload, startUpload } = setup();

    await expect(upload("c1", fileOf("image/gif", 10))).rejects.toBeInstanceOf(
      ImageRejected,
    );

    expect(startUpload).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
