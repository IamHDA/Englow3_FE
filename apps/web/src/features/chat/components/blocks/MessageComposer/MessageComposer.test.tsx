import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";

import { IMAGE_MAX_BYTES, MAX_MESSAGE_LENGTH } from "../../../constants/chat";
import {
  IMAGE_PROBLEM,
  type ImageProblem,
} from "../../../hooks/useImageUpload";

import { MessageComposer } from "./index";

const NAMES = {
  vi: { box: "Tin nhắn", send: "Gửi" },
  en: { box: "Message", send: "Send" },
} as const;

function setup(
  validateImage: (file: File) => ImageProblem | null = () => null,
  language: keyof typeof NAMES = "vi",
) {
  localStorage.setItem("englow3_lang", language);
  const onSend = vi.fn();
  const onTyping = vi.fn();
  const onStopTyping = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <LanguageProvider>
        <MessageComposer
          onSend={onSend}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          validateImage={validateImage}
        />
      </LanguageProvider>
    </MantineProvider>,
  );
  const user = userEvent.setup({ applyAccept: false });
  const box = screen.getByRole("textbox", { name: NAMES[language].box });
  const sendButton = () =>
    screen.getByRole("button", { name: NAMES[language].send });
  const fileInput = () =>
    document.querySelector<HTMLInputElement>('input[type="file"]')!;
  return { onSend, onTyping, onStopTyping, user, box, sendButton, fileInput };
}

const photo = (name = "photo.png", type = "image/png") =>
  new File(["x"], name, { type });

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => localStorage.setItem("englow3_lang", "vi"));

describe("MessageComposer: sending", () => {
  it("sends the text when the button is pressed, trimmed, then empties the box", async () => {
    const { user, box, sendButton, onSend, onStopTyping } = setup();

    await user.type(box, "  xin chào  ");
    await user.click(sendButton());

    await waitFor(() =>
      expect(onSend).toHaveBeenCalledExactlyOnceWith({
        body: "xin chào",
        image: null,
      }),
    );
    expect(box).toHaveValue("");
    expect(onStopTyping).toHaveBeenCalled();
  });

  it("sends on Enter, and breaks the line on Shift+Enter", async () => {
    const { user, box, onSend } = setup();

    await user.type(box, "one{Shift>}{Enter}{/Shift}two");
    expect(onSend).not.toHaveBeenCalled();
    expect(box).toHaveValue("one\ntwo");

    await user.type(box, "{Enter}");
    await waitFor(() =>
      expect(onSend).toHaveBeenCalledExactlyOnceWith({
        body: "one\ntwo",
        image: null,
      }),
    );
  });

  it("does not send on the Enter that confirms an input method's composition", async () => {
    const { box, onSend } = setup();
    fireEvent.change(box, { target: { value: "xin" } });

    fireEvent.keyDown(box, { key: "Enter", isComposing: true });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("cannot send nothing: the button is off for an empty or blank box, and Enter does nothing", async () => {
    const { user, box, sendButton, onSend } = setup();
    expect(sendButton()).toBeDisabled();

    await user.type(box, "   ");
    expect(sendButton()).toBeDisabled();
    await user.type(box, "{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });
});

describe("MessageComposer: the length limit", () => {
  it("says a message is too long, and will not send it", async () => {
    const { user, box, sendButton, onSend } = setup();

    fireEvent.change(box, {
      target: { value: "a".repeat(MAX_MESSAGE_LENGTH + 1) },
    });

    expect(
      await screen.findByText(
        `Tin nhắn dài tối đa ${MAX_MESSAGE_LENGTH} ký tự.`,
      ),
    ).toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
    await user.type(box, "{Enter}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("sends a message of exactly the limit", async () => {
    const { user, box, sendButton, onSend } = setup();

    fireEvent.change(box, {
      target: { value: "a".repeat(MAX_MESSAGE_LENGTH) },
    });
    await waitFor(() => expect(sendButton()).toBeEnabled());
    await user.click(sendButton());

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
  });

  it("shows how much is left once the text is near the limit", async () => {
    const { box } = setup();

    fireEvent.change(box, { target: { value: "a".repeat(3_700) } });

    expect(
      await screen.findByText(`3700/${MAX_MESSAGE_LENGTH}`),
    ).toBeInTheDocument();
  });
});

describe("MessageComposer: telling the other person", () => {
  it("says there is text while the person types, and that there is none once it is cleared", async () => {
    const { user, box, onTyping } = setup();

    await user.type(box, "a");
    expect(onTyping).toHaveBeenLastCalledWith(true);

    await user.clear(box);
    expect(onTyping).toHaveBeenLastCalledWith(false);
  });

  it("says typing stopped when the box is left", async () => {
    const { user, box, onStopTyping } = setup();

    await user.type(box, "a");
    await user.tab();

    expect(onStopTyping).toHaveBeenCalled();
  });
});

describe("MessageComposer: a picture", () => {
  it("shows the chosen picture, and sends it with no text", async () => {
    const { user, fileInput, sendButton, onSend } = setup();
    const file = photo();

    await user.upload(fileInput(), file);

    expect(await screen.findByAltText("Ảnh sắp gửi")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    await user.click(sendButton());
    await waitFor(() =>
      expect(onSend).toHaveBeenCalledExactlyOnceWith({ body: "", image: file }),
    );
    expect(screen.queryByAltText("Ảnh sắp gửi")).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("sends the picture with the text", async () => {
    const { user, fileInput, box, sendButton, onSend } = setup();
    const file = photo();

    await user.upload(fileInput(), file);
    await user.type(box, "nhìn này");
    await user.click(sendButton());

    await waitFor(() =>
      expect(onSend).toHaveBeenCalledExactlyOnceWith({
        body: "nhìn này",
        image: file,
      }),
    );
  });

  it("removes the picture on request, and gives its preview back", async () => {
    const { user, fileInput, sendButton } = setup();
    await user.upload(fileInput(), photo());

    await user.click(await screen.findByRole("button", { name: "Bỏ ảnh" }));

    expect(screen.queryByAltText("Ảnh sắp gửi")).toBeNull();
    expect(sendButton()).toBeDisabled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("says why a file will not do, and keeps nothing", async () => {
    const { user, fileInput, sendButton, onSend } = setup(
      () => IMAGE_PROBLEM.type,
    );

    await user.upload(fileInput(), photo("doc.pdf", "application/pdf"));

    expect(
      await screen.findByText("Chỉ gửi được ảnh JPEG, PNG hoặc WebP."),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("Ảnh sắp gửi")).toBeNull();
    expect(sendButton()).toBeDisabled();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("names the size limit for a file that is too large", async () => {
    const { user, fileInput } = setup(() => IMAGE_PROBLEM.size);

    await user.upload(fileInput(), photo());

    expect(
      await screen.findByText(
        `Ảnh tối đa ${IMAGE_MAX_BYTES / (1024 * 1024)} MB.`,
      ),
    ).toBeInTheDocument();
  });

  it("forgets an earlier refusal once a good file is chosen", async () => {
    let refuse = true;
    const { user, fileInput } = setup(() =>
      refuse ? IMAGE_PROBLEM.type : null,
    );
    await user.upload(fileInput(), photo("a.pdf", "application/pdf"));
    await screen.findByRole("alert");

    refuse = false;
    await user.upload(fileInput(), photo());

    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(screen.getByAltText("Ảnh sắp gửi")).toBeInTheDocument();
  });
});

describe("MessageComposer: English", () => {
  it("says the same things in English", async () => {
    const { box, sendButton } = setup(() => null, "en");

    expect(box).toHaveAttribute("placeholder", "Type a message…");
    expect(sendButton()).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Attach an image" }),
    ).toBeInTheDocument();
  });
});
