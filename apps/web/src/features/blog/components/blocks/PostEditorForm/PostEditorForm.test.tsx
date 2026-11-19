import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BlogTagKind } from "@/lib/graphql/generated";

import {
  MAX_BODY_LENGTH,
  MAX_IMAGES,
  MAX_TITLE_LENGTH,
} from "../../../constants/blog";
import { IMAGE_PROBLEM } from "../../../hooks/useBlogImageUpload";
import {
  renderInApp,
  resetLanguage,
  type TestLanguage,
} from "../../../testing/providers";
import { refusal } from "../../../testing/refusals";
import type { BlogTagCatalogueData } from "../../../types";

import { PostEditorForm } from "./index";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(resetLanguage);
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview-1");
  URL.revokeObjectURL = vi.fn();
});

const CATALOGUE: BlogTagCatalogueData = {
  skills: [
    "LISTENING",
    "SPEAKING",
    "READING",
    "WRITING",
    "VOCABULARY",
    "GRAMMAR",
  ],
  levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
  certificates: ["IELTS", "TOEIC"],
};

const ID = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const TEXT = {
  vi: {
    title: "Tiêu đề",
    body: "Nội dung",
    publish: "Đăng bài",
    save: "Lưu thay đổi",
    write: "Soạn",
    preview: "Xem trước",
    insert: "Chèn ảnh",
    titleRequired: "Hãy nhập tiêu đề.",
    titleTooLong: "Tiêu đề tối đa 200 ký tự.",
    bodyRequired: "Hãy viết nội dung bài.",
    bodyTooLong: "Nội dung tối đa 20000 ký tự.",
    tooManyTags: "Một bài chỉ có tối đa 8 thẻ.",
    tooManyImages: "Một bài chỉ có tối đa 10 ảnh.",
    stale: "Bài đã thay đổi từ lúc bạn mở, tải lại để xem bản mới.",
    reload: "Tải lại bài",
    skill: "Kỹ năng",
    level: "Trình độ",
    imageType: "Chỉ nhận ảnh JPEG, PNG hoặc WebP.",
    uploadFailed: "Chưa tải được ảnh lên. Hãy thử lại.",
    notUploaded: "Ảnh chưa tải lên xong. Hãy đợi ảnh tải xong rồi lưu lại.",
    invalidImage: "Có ảnh không hợp lệ trong bài.",
    titleInvalid: "Tiêu đề cần từ 1 đến 200 ký tự.",
    altDefault: "mô tả ảnh",
  },
  en: {
    title: "Title",
    body: "Text",
    publish: "Publish",
    save: "Save changes",
    write: "Write",
    preview: "Preview",
    insert: "Insert image",
    titleRequired: "Enter a title.",
    titleTooLong: "The title is 200 characters at most.",
    bodyRequired: "Write the text of the post.",
    bodyTooLong: "The text is 20000 characters at most.",
    tooManyTags: "A post has at most 8 tags.",
    tooManyImages: "A post has at most 10 images.",
    stale:
      "The post changed since you opened it, reload it to see the new version.",
    reload: "Reload the post",
    skill: "Skill",
    level: "Level",
    imageType: "Only JPEG, PNG or WebP images are accepted.",
    uploadFailed: "The image could not be uploaded. Try again.",
    notUploaded:
      "An image has not finished uploading. Wait for it, then save again.",
    invalidImage: "There is an image in the post that is not valid.",
    titleInvalid: "The title needs 1 to 200 characters.",
    altDefault: "image description",
  },
} as const;

type Props = Parameters<typeof PostEditorForm>[0];

function setup(props: Partial<Props> = {}, language: TestLanguage = "vi") {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  const onReload = vi.fn();
  const validateImage = vi.fn().mockReturnValue(null);
  const uploadImage = vi.fn().mockResolvedValue({
    imageId: ID(1),
    reference: `blog-image:${ID(1)}`,
  });
  renderInApp(
    <PostEditorForm
      mode="create"
      initial={{ title: "", body: "", tags: [] }}
      savedImages={[]}
      catalogue={CATALOGUE}
      validateImage={validateImage}
      uploadImage={uploadImage}
      onSave={onSave}
      onCancel={onCancel}
      onReload={onReload}
      {...props}
    />,
    language,
  );
  const text = TEXT[language];
  return {
    user: userEvent.setup({ applyAccept: false }),
    onSave,
    onCancel,
    onReload,
    validateImage,
    uploadImage,
    text,
    title: () =>
      screen.getByRole("textbox", { name: new RegExp(`^${text.title}`) }),
    body: () => screen.getByRole("textbox", { name: text.body }),
    publish: () => screen.getByRole("button", { name: text.publish }),
    fileInput: () =>
      document.querySelector<HTMLInputElement>('input[type="file"]')!,
  };
}

/** Types a title and a text that pass every rule. */
async function fillValid(s: ReturnType<typeof setup>) {
  await s.user.type(s.title(), "  A good post  ");
  await s.user.type(s.body(), "Some **markdown**");
}

describe("PostEditorForm: saving", () => {
  it("saves the trimmed title, the text as written and the tags", async () => {
    const s = setup({
      initial: {
        title: "",
        body: "",
        tags: [{ kind: BlogTagKind.SKILL, value: "WRITING" }],
      },
    });

    await fillValid(s);
    await s.user.click(s.publish());

    await waitFor(() =>
      expect(s.onSave).toHaveBeenCalledExactlyOnceWith({
        title: "A good post",
        body: "Some **markdown**",
        tags: [{ kind: BlogTagKind.SKILL, value: "WRITING" }],
      }),
    );
  });

  it("starts from the saved post when editing, and says so on the button", () => {
    const s = setup({
      mode: "update",
      initial: { title: "Old title", body: "Old text", tags: [] },
    });

    expect(s.title()).toHaveValue("Old title");
    expect(s.body()).toHaveValue("Old text");
    expect(
      screen.getByRole("button", { name: s.text.save }),
    ).toBeInTheDocument();
  });

  it("sends only once for a double press, and waits while it is saving", async () => {
    let finish: () => void = () => undefined;
    const onSave = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    const s = setup({ onSave });
    await fillValid(s);

    await s.user.dblClick(s.publish());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(s.publish()).toBeDisabled();
    finish();
  });

  it("cancels without saving", async () => {
    const s = setup();

    await s.user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(s.onCancel).toHaveBeenCalledTimes(1);
    expect(s.onSave).not.toHaveBeenCalled();
  });
});

describe.each(["vi", "en"] as const)(
  "PostEditorForm: the rules, in %s",
  (language) => {
    it("needs a title and a text, and a title of blanks is none", async () => {
      const s = setup({}, language);

      await s.user.type(s.title(), "    ");
      await s.user.type(s.body(), "   ");
      await s.user.click(s.publish());

      expect(await screen.findByText(s.text.titleRequired)).toBeInTheDocument();
      expect(screen.getByText(s.text.bodyRequired)).toBeInTheDocument();
      expect(s.onSave).not.toHaveBeenCalled();
    });

    it("takes a title of exactly 200 characters and refuses 201", async () => {
      const s = setup({}, language);
      await s.user.type(s.body(), "text");
      await s.user.click(s.title());

      await s.user.paste("t".repeat(MAX_TITLE_LENGTH + 1));
      await s.user.click(s.publish());
      expect(await screen.findByText(s.text.titleTooLong)).toBeInTheDocument();
      expect(s.onSave).not.toHaveBeenCalled();

      await s.user.clear(s.title());
      await s.user.paste("t".repeat(MAX_TITLE_LENGTH));
      await s.user.click(s.publish());
      await waitFor(() => expect(s.onSave).toHaveBeenCalledTimes(1));
    });

    it("takes a text of exactly 20000 characters and refuses 20001", async () => {
      const s = setup({}, language);
      await s.user.type(s.title(), "title");
      await s.user.click(s.body());

      await s.user.paste("b".repeat(MAX_BODY_LENGTH + 1));
      await s.user.click(s.publish());
      expect(await screen.findByText(s.text.bodyTooLong)).toBeInTheDocument();
      expect(s.onSave).not.toHaveBeenCalled();

      await s.user.clear(s.body());
      await s.user.paste("b".repeat(MAX_BODY_LENGTH));
      await s.user.click(s.publish());
      await waitFor(() => expect(s.onSave).toHaveBeenCalledTimes(1));
    });

    it("refuses a ninth tag, naming the limit, and sends nothing", async () => {
      const eight = [
        ...CATALOGUE.skills.map((value) => ({
          kind: BlogTagKind.SKILL,
          value,
        })),
        { kind: BlogTagKind.LEVEL, value: "A1" },
        { kind: BlogTagKind.LEVEL, value: "A2" },
      ];
      const s = setup(
        { initial: { title: "t", body: "b", tags: eight } },
        language,
      );

      await s.user.click(screen.getByRole("combobox", { name: s.text.level }));
      await s.user.click(await screen.findByRole("option", { name: "B1" }));
      await s.user.click(s.publish());

      expect(await screen.findByText(s.text.tooManyTags)).toBeInTheDocument();
      expect(s.onSave).not.toHaveBeenCalled();
    });

    it("takes ten images in the text and refuses an eleventh, counted by distinct reference", async () => {
      const reference = (n: number) => `![](blog-image:${ID(n)})`;
      const ten = Array.from({ length: MAX_IMAGES }, (_, i) =>
        reference(i + 1),
      ).join("\n\n");
      const s = setup(
        { initial: { title: "t", body: ten, tags: [] } },
        language,
      );

      // The same image named twice is one image.
      fireEvent.change(s.body(), {
        target: { value: `${ten}\n\n${reference(1)}` },
      });
      await s.user.click(s.publish());
      await waitFor(() => expect(s.onSave).toHaveBeenCalledTimes(1));

      fireEvent.change(s.body(), {
        target: { value: `${ten}\n\n${reference(99)}` },
      });
      await s.user.click(s.publish());
      expect(await screen.findByText(s.text.tooManyImages)).toBeInTheDocument();
      expect(s.onSave).toHaveBeenCalledTimes(1);
    });
  },
);

describe("PostEditorForm: what the backend refuses", () => {
  async function saveRefused(code: string, status = "BAD_USER_INPUT") {
    const onSave = vi.fn().mockRejectedValue(refusal(code, status));
    const s = setup({ onSave });
    await fillValid(s);
    await s.user.click(s.publish());
    return s;
  }

  it("puts a refused title under the title, and keeps what was typed", async () => {
    const s = await saveRefused("BLOG_TITLE_INVALID");

    expect(await screen.findByText(s.text.titleInvalid)).toBeInTheDocument();
    expect(s.title()).toHaveValue("  A good post  ");
  });

  it.each([
    ["BLOG_IMAGE_NOT_UPLOADED", "notUploaded", "CONFLICT"],
    ["BLOG_IMAGE_INVALID", "invalidImage", "BAD_USER_INPUT"],
  ] as const)(
    "puts %s under the text, in plain words",
    async (code, key, status) => {
      const s = await saveRefused(code, status);

      expect(await screen.findByText(s.text[key])).toBeInTheDocument();
    },
  );

  it("puts a refused tag list under the tags", async () => {
    await saveRefused("BLOG_TOO_MANY_TAGS");

    expect(
      await screen.findByText("Một bài viết chỉ có tối đa 8 thẻ."),
    ).toBeInTheDocument();
  });

  it("says in a sentence above the buttons what is not about one field", async () => {
    await saveRefused("RATE_LIMITED", "TOO_MANY_REQUESTS");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bạn thao tác hơi nhanh. Hãy thử lại sau vài phút.",
    );
  });

  it.each(["vi", "en"] as const)(
    "says the post changed since it was opened, in %s, keeps the text and offers to reload",
    async (language) => {
      const onSave = vi
        .fn()
        .mockRejectedValue(refusal("BLOG_POST_STALE", "CONFLICT"));
      const s = setup({ onSave, mode: "update" }, language);
      await fillValid(s);
      await s.user.click(screen.getByRole("button", { name: s.text.save }));

      expect(await screen.findByText(s.text.stale)).toBeInTheDocument();
      expect(s.body()).toHaveValue("Some **markdown**");

      await s.user.click(screen.getByRole("button", { name: s.text.reload }));
      expect(s.onReload).toHaveBeenCalledTimes(1);
    },
  );
});

describe("PostEditorForm: images", () => {
  async function chooseImage(s: ReturnType<typeof setup>, name = "photo.png") {
    await s.user.upload(
      s.fileInput(),
      new File(["x"], name, { type: "image/png" }),
    );
  }

  it("uploads the picture and writes its reference into the text at the cursor - never an address", async () => {
    const s = setup();
    await s.user.type(s.body(), "Before");

    await chooseImage(s);

    await waitFor(() =>
      expect(s.body()).toHaveValue(
        `Before\n\n![${s.text.altDefault}](blog-image:${ID(1)})`,
      ),
    );
    expect(s.uploadImage).toHaveBeenCalledWith(expect.any(File), 0);
    expect((s.body() as HTMLTextAreaElement).value).not.toContain("blob:");
  });

  it("counts the images already in the text against the limit it hands the upload", async () => {
    const s = setup({
      initial: { title: "", body: `![](blog-image:${ID(5)})`, tags: [] },
    });

    await chooseImage(s);

    await waitFor(() =>
      expect(s.uploadImage).toHaveBeenCalledWith(expect.any(File), 1),
    );
  });

  it("draws the picture just uploaded in the preview, from the file chosen", async () => {
    const s = setup();
    await s.user.type(s.title(), "t");
    await chooseImage(s);
    await waitFor(() =>
      expect((s.body() as HTMLTextAreaElement).value).toContain("blog-image:"),
    );

    await s.user.click(screen.getByRole("tab", { name: s.text.preview }));

    const panel = screen.getByRole("tabpanel", { name: s.text.preview });
    expect(within(panel).getByRole("img")).toHaveAttribute(
      "src",
      "blob:http://localhost/preview-1",
    );
  });

  it("draws an image the saved post has, from the backend's link", async () => {
    const s = setup({
      mode: "update",
      initial: { title: "t", body: `![pic](blog-image:${ID(7)})`, tags: [] },
      savedImages: [{ id: ID(7), url: "https://storage.example/a.png?sig=1" }],
    });

    await s.user.click(screen.getByRole("tab", { name: s.text.preview }));

    expect(
      within(screen.getByRole("tabpanel", { name: s.text.preview })).getByRole(
        "img",
      ),
    ).toHaveAttribute("src", "https://storage.example/a.png?sig=1");
  });

  it("never draws an image from another site in the preview, nor makes the browser ask for one", async () => {
    const s = setup({
      initial: {
        title: "t",
        body: "![pixel](https://evil.example/pixel.png) and ![x](data:image/png;base64,AAAA)",
        tags: [],
      },
    });

    await s.user.click(screen.getByRole("tab", { name: s.text.preview }));

    const panel = screen.getByRole("tabpanel", { name: s.text.preview });
    expect(within(panel).queryByRole("img")).not.toBeInTheDocument();
    expect(panel.querySelector("img")).toBeNull();
  });

  it("says why a file is refused, and uploads nothing", async () => {
    const validateImage = vi.fn().mockReturnValue(IMAGE_PROBLEM.type);
    const s = setup({ validateImage });

    await s.user.upload(
      s.fileInput(),
      new File(["x"], "doc.gif", { type: "image/gif" }),
    );

    expect(await screen.findByText(s.text.imageType)).toBeInTheDocument();
    expect(s.uploadImage).not.toHaveBeenCalled();
    expect(s.body()).toHaveValue("");
  });

  it("says so when the upload failed, and writes nothing into the text", async () => {
    const uploadImage = vi
      .fn()
      .mockRejectedValue(new Error("Image upload failed with 403"));
    const s = setup({ uploadImage });

    await chooseImage(s);

    expect(await screen.findByText(s.text.uploadFailed)).toBeInTheDocument();
    expect(s.body()).toHaveValue("");
  });

  it("shows how many images the text names", async () => {
    setup({
      initial: {
        title: "",
        body: `![](blog-image:${ID(1)}) ![](blog-image:${ID(2)})`,
        tags: [],
      },
    });

    expect(screen.getByText("2/10 ảnh")).toBeInTheDocument();
  });
});
