import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IMAGE_MAX_BYTES, MAX_IMAGES } from "../constants/blog";

import {
  IMAGE_PROBLEM,
  ImageRejected,
  useBlogImageUpload,
} from "./useBlogImageUpload";

const ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";

const file = (type = "image/png", size = 5) =>
  new File([new Uint8Array(size)], "photo", { type });

function setup() {
  const startUpload = vi.fn().mockResolvedValue({
    imageId: ID,
    uploadUrl: "https://storage.example/blog/posts/u1/x.png?sig=1",
    contentType: "image/png",
    reference: `blog-image:${ID}`,
  });
  const hook = renderHook(() => useBlogImageUpload({ startUpload }));
  return { ...hook, startUpload };
}

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("validate", () => {
  it("accepts a JPEG, a PNG and a WebP within the size", () => {
    const { result } = setup();
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
      expect(result.current.validate(file(type), 0)).toBeNull();
    }
  });

  it("refuses any other type", () => {
    const { result } = setup();
    for (const type of ["image/gif", "image/svg+xml", "application/pdf", ""]) {
      expect(result.current.validate(file(type), 0)).toBe(IMAGE_PROBLEM.type);
    }
  });

  it("refuses an empty file and one over 5 MB, and takes one of exactly 5 MB", () => {
    const { result } = setup();
    expect(result.current.validate(file("image/png", 0), 0)).toBe(
      IMAGE_PROBLEM.empty,
    );
    expect(
      result.current.validate(file("image/png", IMAGE_MAX_BYTES), 0),
    ).toBeNull();
    expect(
      result.current.validate(file("image/png", IMAGE_MAX_BYTES + 1), 0),
    ).toBe(IMAGE_PROBLEM.size);
  });

  it("refuses an eleventh image, and takes the tenth", () => {
    const { result } = setup();
    expect(result.current.validate(file(), MAX_IMAGES - 1)).toBeNull();
    expect(result.current.validate(file(), MAX_IMAGES)).toBe(
      IMAGE_PROBLEM.tooMany,
    );
  });
});

describe("upload", () => {
  it("asks for an address with the file's type and size, PUTs the bytes with that type, and returns the reference to write", async () => {
    const { result, startUpload } = setup();
    const photo = file("image/png", 1234);

    const uploaded = await result.current.upload(photo, 0);

    expect(startUpload).toHaveBeenCalledExactlyOnceWith({
      contentType: "image/png",
      contentLength: 1234,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://storage.example/blog/posts/u1/x.png?sig=1");
    expect(init.method).toBe("PUT");
    expect(init.headers).toEqual({ "Content-Type": "image/png" });
    expect(init.body).toBe(photo);
    expect(uploaded).toEqual({ imageId: ID, reference: `blog-image:${ID}` });
  });

  it("puts the type the backend signed on the request, not the file's own", async () => {
    const { result, startUpload } = setup();
    startUpload.mockResolvedValue({
      imageId: ID,
      uploadUrl: "https://storage.example/x",
      contentType: "image/jpeg",
      reference: `blog-image:${ID}`,
    });

    await result.current.upload(file("image/png"), 0);

    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      "Content-Type": "image/jpeg",
    });
  });

  it("asks the backend for nothing for a file it refuses", async () => {
    const { result, startUpload } = setup();

    await expect(
      result.current.upload(file("image/gif"), 0),
    ).rejects.toMatchObject(new ImageRejected(IMAGE_PROBLEM.type));
    await expect(
      result.current.upload(file(), MAX_IMAGES),
    ).rejects.toMatchObject({ problem: IMAGE_PROBLEM.tooMany });
    expect(startUpload).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns no reference when storage refuses the bytes", async () => {
    const { result } = setup();
    fetchMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(result.current.upload(file(), 0)).rejects.toThrow(
      "Image upload failed with 403",
    );
  });

  it("returns no reference when the backend would not give an address", async () => {
    const { result, startUpload } = setup();
    startUpload.mockRejectedValue(new Error("refused"));

    await expect(result.current.upload(file(), 0)).rejects.toThrow("refused");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
