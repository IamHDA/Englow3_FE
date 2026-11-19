"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  FileButton,
  Group,
  Image,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { ImagePlus, SendHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_BYTES,
  MAX_MESSAGE_LENGTH,
  MESSAGE_LENGTH_WARNING_AT,
} from "../../../constants/chat";
import {
  IMAGE_PROBLEM,
  type ImageProblem,
} from "../../../hooks/useImageUpload";
import {
  createMessageSchema,
  type MessageFormValues,
} from "../../../schemas/message";

import classes from "./MessageComposer.module.css";

const BYTES_PER_MB = 1024 * 1024;
const ACCEPT = IMAGE_ACCEPTED_TYPES.join(",");

type MessageComposerProps = {
  /** The message, as typed and with the picture chosen if any. Sending is the caller's: this does not wait for it. */
  onSend: (message: { body: string; image: File | null }) => void;
  /** The text changed; whether there is any left. */
  onTyping: (hasText: boolean) => void;
  /** The box was left or the message sent. */
  onStopTyping: () => void;
  /** What is wrong with a file as a chat image, or null. Only to say so before it is sent. */
  validateImage: (file: File) => ImageProblem | null;
};

/** A picture chosen and the address its preview is drawn from, which this box made and must give back. */
type Attachment = { file: File; previewUrl: string };

/**
 * The box a message is written in: text (Enter sends, Shift+Enter breaks the
 * line, as in every chat) and one picture. The text is a React Hook Form field
 * with a Zod length - 4000, the backend's - and the picture is checked as it is
 * chosen, so the person hears it will not do before they have written the
 * message around it.
 */
export function MessageComposer({
  onSend,
  onTyping,
  onStopTyping,
  validateImage,
}: MessageComposerProps) {
  const copy = useLanguage().t.chat.composer;
  const schema = useMemo(
    () =>
      createMessageSchema(
        copy.tooLong.replace("{max}", String(MAX_MESSAGE_LENGTH)),
      ),
    [copy.tooLong],
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MessageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { body: "" },
    mode: "onChange",
  });

  const body = useWatch({ control, name: "body" });
  const hasText = body.trim().length > 0;

  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [problem, setProblem] = useState<ImageProblem | null>(null);
  // The file picker remembers the last file it gave, and says nothing when the
  // same one is chosen again after it was removed. A new key is a new picker.
  const [pickerKey, setPickerKey] = useState(0);

  // The preview address is made when the file is chosen and given back when it
  // goes - replaced, removed, sent, or the box unmounted.
  useEffect(() => {
    const url = attachment?.previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  function pick(file: File | null) {
    if (!file) return;
    const found = validateImage(file);
    setProblem(found);
    setAttachment(
      found ? null : { file, previewUrl: URL.createObjectURL(file) },
    );
  }

  function discardAttachment() {
    setAttachment(null);
    setProblem(null);
    setPickerKey((key) => key + 1);
  }

  const submit = handleSubmit((values) => {
    if (!hasText && !attachment) return;
    onSend({ body: values.body.trim(), image: attachment?.file ?? null });
    reset({ body: "" });
    discardAttachment();
    onStopTyping();
  });

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  }

  const problemText =
    problem === null
      ? null
      : problem === IMAGE_PROBLEM.type
        ? copy.imageType
        : problem === IMAGE_PROBLEM.size
          ? copy.imageSize.replace(
              "{max}",
              String(IMAGE_MAX_BYTES / BYTES_PER_MB),
            )
          : copy.imageEmpty;

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap={6} p="sm">
        {attachment && (
          <Box className={classes.preview}>
            <Image
              className={classes.thumbnail}
              src={attachment.previewUrl}
              alt={copy.imagePreviewAlt}
              radius="md"
              fit="cover"
            />
            <ActionIcon
              className={classes.remove}
              size={24}
              radius="xl"
              variant="default"
              aria-label={copy.removeImage}
              onClick={discardAttachment}
            >
              <X size={14} aria-hidden="true" />
            </ActionIcon>
          </Box>
        )}
        {problemText && (
          <Text size="xs" c="warn.7" role="alert">
            {problemText}
          </Text>
        )}
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <FileButton key={pickerKey} onChange={pick} accept={ACCEPT}>
            {(props) => (
              <ActionIcon
                {...props}
                size={44}
                radius="md"
                variant="default"
                aria-label={copy.attach}
              >
                <ImagePlus size={20} aria-hidden="true" />
              </ActionIcon>
            )}
          </FileButton>
          <Textarea
            flex={1}
            autosize
            minRows={1}
            maxRows={5}
            radius="md"
            aria-label={copy.label}
            placeholder={copy.placeholder}
            autoComplete="off"
            error={errors.body?.message}
            onKeyDown={onKeyDown}
            {...register("body", {
              onChange: (event) =>
                onTyping(event.target.value.trim().length > 0),
              onBlur: onStopTyping,
            })}
          />
          <ActionIcon
            type="submit"
            size={44}
            radius="md"
            disabled={(!hasText && !attachment) || Boolean(errors.body)}
            aria-label={copy.send}
          >
            <SendHorizontal size={20} aria-hidden="true" />
          </ActionIcon>
        </Group>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text size="xs" c="ink.5" visibleFrom="sm">
            {copy.hint}
          </Text>
          {body.length >= MESSAGE_LENGTH_WARNING_AT && (
            <Text size="xs" c={errors.body ? "warn.7" : "ink.5"} ml="auto">
              {body.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          )}
        </Group>
      </Stack>
    </form>
  );
}
