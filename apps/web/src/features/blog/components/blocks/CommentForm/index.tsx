"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Group, Stack, Text, Textarea } from "@mantine/core";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  BACKEND_CODES,
  COMMENT_COUNTER_FROM,
  MAX_COMMENT_LENGTH,
} from "../../../constants/blog";
import { sentenceForCode } from "../../../constants/blogErrors";
import {
  createCommentSchema,
  type CommentFormValues,
} from "../../../schemas/comment";

type CommentFormProps = {
  /** Set to edit a comment: the text it has now. Left out to write a new one, and the box then empties after it is sent. */
  initialBody?: string;
  /** What the button says. */
  submitLabel: string;
  /** Saves the text. Rejects with the BFF's error when the backend refused. */
  onSubmit: (body: string) => Promise<void>;
  /** Shown as a second button, to stop editing. */
  onCancel?: () => void;
  autoFocus?: boolean;
};

/**
 * The box a comment is written or edited in: React Hook Form with a Zod rule of
 * 1-2000 characters (the backend's). A refusal of the text itself lands under
 * the box; any other refusal - a post that closed meanwhile - is a sentence
 * above it.
 */
export function CommentForm({
  initialBody,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const { t } = useLanguage();
  const copy = t.blog.comments.form;
  const schema = useMemo(
    () =>
      createCommentSchema({
        required: copy.required,
        tooLong: copy.tooLong.replace("{max}", String(MAX_COMMENT_LENGTH)),
      }),
    [copy.required, copy.tooLong],
  );
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { body: initialBody ?? "" },
  });
  const [failure, setFailure] = useState<string | null>(null);
  const body = useWatch({ control, name: "body" });

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSubmit(values.body.trim());
      if (initialBody === undefined) reset({ body: "" });
    } catch (error) {
      const code = backendCodeOf(error);
      const sentence = sentenceForCode(t.blog, code);
      if (code === BACKEND_CODES.commentInvalid) {
        setError("body", { type: "server", message: sentence });
      } else {
        setFailure(sentence);
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="xs">
        {failure && (
          <Alert color="warn" radius="md" role="alert">
            {failure}
          </Alert>
        )}
        <Textarea
          aria-label={copy.label}
          placeholder={copy.placeholder}
          autosize
          minRows={3}
          maxRows={10}
          radius="md"
          autoFocus={autoFocus}
          error={errors.body?.message}
          {...register("body")}
        />
        <Group justify="space-between" gap="sm" align="center">
          {body.length >= COMMENT_COUNTER_FROM ? (
            <Text size="xs" c={errors.body ? "warn.7" : "ink.5"}>
              {copy.counter
                .replace("{count}", String(body.length))
                .replace("{max}", String(MAX_COMMENT_LENGTH))}
            </Text>
          ) : (
            <span />
          )}
          <Group gap="xs">
            {onCancel && (
              <Button
                variant="default"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {copy.cancel}
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </Group>
        </Group>
      </Stack>
    </form>
  );
}
