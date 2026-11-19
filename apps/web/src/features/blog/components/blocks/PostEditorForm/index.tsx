"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  FileButton,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { mergeRefs } from "@mantine/hooks";
import { ImagePlus, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  BACKEND_CODES,
  BODY_COUNTER_FROM,
  IMAGE_ACCEPTED_TYPES,
  IMAGE_MAX_MB,
  MAX_BODY_LENGTH,
  MAX_IMAGES,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  POST_FIELD_BY_CODE,
} from "../../../constants/blog";
import { sentenceForCode } from "../../../constants/blogErrors";
import {
  IMAGE_PROBLEM,
  type ImageProblem,
  type UploadedImage,
} from "../../../hooks/useBlogImageUpload";
import { useUnsavedChangesGuard } from "../../../hooks/useUnsavedChangesGuard";
import {
  countImageReferences,
  imageMarkdown,
} from "../../../markdown/references";
import { createPostSchema, type PostFormValues } from "../../../schemas/post";
import type {
  BlogImageData,
  BlogTagCatalogueData,
  BlogTagData,
} from "../../../types";
import { ConfirmModal } from "../../parts/ConfirmModal";
import { MarkdownContent } from "../MarkdownContent";

import { TagPicker } from "./TagPicker";

const ACCEPT = IMAGE_ACCEPTED_TYPES.join(",");

/** The two panes of the body: the Markdown being written, and how it will read. */
const PANE = { write: "write", preview: "preview" } as const;
type Pane = (typeof PANE)[keyof typeof PANE];

type PostEditorFormProps = {
  /** What the form starts from: empty for a new post, the saved one when editing. */
  initial: { title: string; body: string; tags: BlogTagData[] };
  mode: "create" | "update";
  /** The images the saved post has, so its preview can draw them. */
  savedImages: ReadonlyArray<Pick<BlogImageData, "id" | "url">>;
  /** The words a tag may be, or null when they could not be loaded - the post is then saved with the tags it has. */
  catalogue: BlogTagCatalogueData | null;
  /** What is wrong with a file as a blog image, or null (`useBlogImageUpload`). */
  validateImage: (file: File, imagesInPost: number) => ImageProblem | null;
  /** Puts a file in storage and resolves to the reference to write. Rejects when it did not finish. */
  uploadImage: (file: File, imagesInPost: number) => Promise<UploadedImage>;
  /** Saves the post. Rejects with the BFF's error when the backend refused. */
  onSave: (values: PostFormValues) => Promise<void>;
  onCancel: () => void;
  /** The post changed since it was opened (BLOG_POST_STALE): fetch it again. */
  onReload: () => void;
};

/** A picture just chosen, and the address its preview is drawn from: made here, so given back here. */
type Preview = { id: string; url: string };

/**
 * The editor of a post - React Hook Form with a Zod rule that is the backend's:
 * a title of 1-200 characters, a text of 1-20 000, at most 8 tags and at most
 * 10 images. The text is Markdown, written in one pane and read in the other
 * ("Preview" draws it exactly as the post will be drawn, from the same
 * component, with the same rule that no image is shown but the ones this post
 * holds).
 *
 * An image is added with a button: it is uploaded first, and what goes into the
 * text at the cursor is the reference the backend returned - never an address -
 * while the preview of it is drawn from the file the person chose. A refusal of
 * the save lands under the field it is about; a post that changed meanwhile
 * says so and offers to reload; anything else is a sentence above the buttons.
 *
 * While there are changes that are not saved, leaving the page asks first.
 */
export function PostEditorForm({
  initial,
  mode,
  savedImages,
  catalogue,
  validateImage,
  uploadImage,
  onSave,
  onCancel,
  onReload,
}: PostEditorFormProps) {
  const { t } = useLanguage();
  const copy = t.blog.editor;
  const schema = useMemo(
    () =>
      createPostSchema({
        titleRequired: copy.postTitle.required,
        titleTooLong: copy.postTitle.tooLong.replace(
          "{max}",
          String(MAX_TITLE_LENGTH),
        ),
        bodyRequired: copy.body.required,
        bodyTooLong: copy.body.tooLong.replace(
          "{max}",
          String(MAX_BODY_LENGTH),
        ),
        tooManyTags: copy.tags.tooMany.replace("{max}", String(MAX_TAGS)),
        tooManyImages: copy.images.tooMany.replace("{max}", String(MAX_IMAGES)),
      }),
    [copy],
  );
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial.title,
      body: initial.body,
      tags: initial.tags.map(({ kind, value }) => ({ kind, value })),
    },
  });
  const body = useWatch({ control, name: "body" });
  const tags = useWatch({ control, name: "tags" });
  const imageCount = countImageReferences(body);

  const [pane, setPane] = useState<Pane>(PANE.write);
  const [failure, setFailure] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageProblem, setImageProblem] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const bodyField = useRef<HTMLTextAreaElement>(null);

  const guard = useUnsavedChangesGuard(isDirty);

  // Previews are made when a picture is chosen and given back when the form
  // goes. They are kept in a ref as well, so the cleanup sees the ones made
  // since the effect ran.
  const madePreviews = useRef<string[]>([]);
  useEffect(() => {
    const made = madePreviews.current;
    return () => {
      for (const url of made) URL.revokeObjectURL(url);
    };
  }, []);

  const problemText = (problem: ImageProblem): string => {
    switch (problem) {
      case IMAGE_PROBLEM.type:
        return copy.images.type;
      case IMAGE_PROBLEM.size:
        return copy.images.size.replace("{max}", String(IMAGE_MAX_MB));
      case IMAGE_PROBLEM.empty:
        return copy.images.empty;
      case IMAGE_PROBLEM.tooMany:
        return copy.images.tooMany.replace("{max}", String(MAX_IMAGES));
      default: {
        const unreachable: never = problem;
        return unreachable;
      }
    }
  };

  /** Writes the image into the text where the cursor is, on a paragraph of its own. */
  function insertAtCursor(markdown: string) {
    const field = bodyField.current;
    const text = getValues("body");
    const start = field?.selectionStart ?? text.length;
    const end = field?.selectionEnd ?? text.length;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const lead =
      before === "" || before.endsWith("\n\n")
        ? ""
        : before.endsWith("\n")
          ? "\n"
          : "\n\n";
    const tail =
      after === "" || after.startsWith("\n\n")
        ? ""
        : after.startsWith("\n")
          ? "\n"
          : "\n\n";
    setValue("body", `${before}${lead}${markdown}${tail}${after}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
    const caret = before.length + lead.length + markdown.length;
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  }

  async function chooseImage(file: File | null) {
    if (!file) return;
    const problem = validateImage(file, imageCount);
    if (problem) {
      setImageProblem(problemText(problem));
      return;
    }
    setImageProblem(null);
    setUploading(true);
    try {
      const uploaded = await uploadImage(file, imageCount);
      const url = URL.createObjectURL(file);
      madePreviews.current.push(url);
      setPreviews((current) => [...current, { id: uploaded.imageId, url }]);
      insertAtCursor(imageMarkdown(uploaded.reference, copy.images.altDefault));
    } catch (error) {
      setImageProblem(
        backendCodeOf(error)
          ? sentenceForCode(t.blog, backendCodeOf(error))
          : copy.images.uploadFailed,
      );
    } finally {
      setUploading(false);
    }
  }

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    setStale(false);
    try {
      await onSave(values);
      // Saved: what is on the page is now what is stored, so leaving it asks nothing.
      reset(values);
    } catch (error) {
      const code = backendCodeOf(error);
      if (code === BACKEND_CODES.postStale) {
        setStale(true);
        return;
      }
      const sentence = sentenceForCode(t.blog, code);
      const field = code ? POST_FIELD_BY_CODE[code] : undefined;
      if (field) {
        setError(field, { type: "server", message: sentence });
      } else {
        setFailure(sentence);
      }
    }
  });

  const previewImages = useMemo(
    () => [...savedImages, ...previews],
    [savedImages, previews],
  );

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="lg">
        <TextInput
          label={copy.postTitle.label}
          placeholder={copy.postTitle.placeholder}
          size="md"
          withAsterisk
          error={errors.title?.message}
          {...register("title")}
        />

        <Stack gap="xs">
          <Tabs
            value={pane}
            onChange={(next) =>
              setPane(next === PANE.preview ? PANE.preview : PANE.write)
            }
          >
            <Group justify="space-between" align="flex-end" gap="sm">
              <Tabs.List>
                <Tabs.Tab value={PANE.write}>{copy.body.tabWrite}</Tabs.Tab>
                <Tabs.Tab value={PANE.preview}>{copy.body.tabPreview}</Tabs.Tab>
              </Tabs.List>
              <Group gap="xs" pb={6}>
                <Text
                  size="xs"
                  c={imageCount >= MAX_IMAGES ? "warn.7" : "ink.5"}
                >
                  {copy.images.count
                    .replace("{count}", String(imageCount))
                    .replace("{max}", String(MAX_IMAGES))}
                </Text>
                <FileButton onChange={chooseImage} accept={ACCEPT}>
                  {(props) => (
                    <Button
                      {...props}
                      variant="default"
                      size="compact-md"
                      loading={uploading}
                      leftSection={<ImagePlus size={16} aria-hidden="true" />}
                    >
                      {copy.images.insert}
                    </Button>
                  )}
                </FileButton>
              </Group>
            </Group>

            <Tabs.Panel value={PANE.write} pt="sm">
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <Textarea
                    ref={mergeRefs(field.ref, bodyField)}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-label={copy.body.label}
                    placeholder={copy.body.placeholder}
                    autosize
                    minRows={14}
                    maxRows={40}
                    radius="md"
                    error={errors.body?.message}
                  />
                )}
              />
            </Tabs.Panel>

            <Tabs.Panel value={PANE.preview} pt="sm">
              <Paper withBorder radius="md" p="lg" mih={200}>
                {body.trim() ? (
                  <MarkdownContent body={body} images={previewImages} />
                ) : (
                  <Text c="ink.5" size="sm">
                    {copy.body.previewEmpty}
                  </Text>
                )}
              </Paper>
            </Tabs.Panel>
          </Tabs>

          {imageProblem && (
            <Text size="xs" c="warn.7" role="alert">
              {imageProblem}
            </Text>
          )}
          {pane === PANE.preview && errors.body?.message && (
            <Text size="xs" c="warn.7">
              {errors.body.message}
            </Text>
          )}
          <Group justify="space-between" gap="sm" align="flex-start">
            <Text size="xs" c="ink.5" maw={520}>
              {copy.body.help}
            </Text>
            {body.length >= BODY_COUNTER_FROM && (
              <Text size="xs" c={errors.body ? "warn.7" : "ink.5"}>
                {copy.body.counter
                  .replace("{count}", String(body.length))
                  .replace("{max}", String(MAX_BODY_LENGTH))}
              </Text>
            )}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Text fw={600} size="sm">
            {copy.tags.label}
          </Text>
          <Text size="xs" c="ink.5">
            {copy.tags.description.replace("{max}", String(MAX_TAGS))}
          </Text>
          {catalogue ? (
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagPicker
                  value={field.value}
                  onChange={field.onChange}
                  catalogue={catalogue}
                />
              )}
            />
          ) : (
            <Text size="sm" c="ink.6">
              {t.blog.list.catalogueError}
            </Text>
          )}
          <Group justify="space-between" gap="sm">
            {errors.tags?.message ? (
              <Text size="xs" c="warn.7" role="alert">
                {errors.tags.message}
              </Text>
            ) : (
              <span />
            )}
            <Text size="xs" c={tags.length > MAX_TAGS ? "warn.7" : "ink.5"}>
              {copy.tags.counter
                .replace("{count}", String(tags.length))
                .replace("{max}", String(MAX_TAGS))}
            </Text>
          </Group>
        </Stack>

        {stale && (
          <Alert
            color="orange"
            radius="md"
            role="alert"
            icon={<TriangleAlert size={20} aria-hidden="true" />}
          >
            <Text size="sm">{copy.stale}</Text>
            <Button
              variant="light"
              color="orange"
              size="sm"
              mt="sm"
              onClick={onReload}
            >
              {copy.staleReload}
            </Button>
          </Alert>
        )}
        {failure && (
          <Alert color="warn" radius="md" role="alert">
            {failure}
          </Alert>
        )}

        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            onClick={() => guard.confirmBefore(onCancel)}
            disabled={isSubmitting}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={uploading}>
            {mode === "create" ? copy.saveNew : copy.save}
          </Button>
        </Group>
      </Stack>

      <ConfirmModal
        opened={guard.asking}
        title={copy.leave.title}
        body={copy.leave.body}
        confirmLabel={copy.leave.confirmLabel}
        cancelLabel={copy.leave.cancelLabel}
        danger
        onConfirm={guard.leave}
        onCancel={guard.stay}
      />
    </form>
  );
}
