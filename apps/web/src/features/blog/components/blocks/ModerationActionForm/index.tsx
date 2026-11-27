"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Radio, Stack, Text, Textarea } from "@mantine/core";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { BlogModerationAction } from "@/lib/graphql/generated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  BACKEND_CODES,
  MAX_MODERATION_REASON_LENGTH,
} from "../../../constants/blog";
import { sentenceForCode } from "../../../constants/blogErrors";
import { MODERATION_ACTION_KEY } from "../../../constants/blogLabels";
import {
  createModerationSchema,
  type ModerationFormValues,
} from "../../../schemas/moderation";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

type ModerationActionFormProps = {
  /** What the screen offers for the content as it stands (`offeredActions`). The backend still decides. */
  actions: BlogModerationAction[];
  /** Applies the decision. Rejects with the BFF's error when the backend refused. */
  onSubmit: (values: ModerationFormValues) => Promise<void>;
};

/**
 * What a moderator decides about content: one of the actions on offer and,
 * always, a reason of 1-500 characters - React Hook Form with a Zod rule.
 * Removing is permanent, so it asks first and says so. A refusal of the reason
 * lands under the box; any other - the content changed since the page was
 * opened, it is the moderator's own - is a sentence above it.
 */
export function ModerationActionForm({
  actions,
  onSubmit,
}: ModerationActionFormProps) {
  const { t } = useLanguage();
  const copy = t.blog.admin.form;
  const schema = useMemo(
    () =>
      createModerationSchema({
        actionRequired: copy.actionRequired,
        reasonRequired: copy.reasonRequired,
        reasonTooLong: copy.reasonTooLong.replace(
          "{max}",
          String(MAX_MODERATION_REASON_LENGTH),
        ),
      }),
    [copy.actionRequired, copy.reasonRequired, copy.reasonTooLong],
  );
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ModerationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });
  const [failure, setFailure] = useState<string | null>(null);
  // Not `isSubmitting`: a removal is applied after a confirmation, outside the
  // submit handler, and the button and the confirmation both have to wait for it.
  const [applying, setApplying] = useState(false);
  const [confirming, setConfirming] = useState<ModerationFormValues | null>(
    null,
  );

  async function apply(values: ModerationFormValues) {
    setFailure(null);
    setApplying(true);
    try {
      await onSubmit(values);
      reset({ reason: "" });
    } catch (error) {
      const code = backendCodeOf(error);
      const sentence = sentenceForCode(t.blog, code);
      if (code === BACKEND_CODES.moderationReasonInvalid) {
        setError("reason", { type: "server", message: sentence });
      } else {
        setFailure(sentence);
      }
    } finally {
      setApplying(false);
      setConfirming(null);
    }
  }

  const submit = handleSubmit((values) => {
    if (values.action === BlogModerationAction.REMOVE) {
      setConfirming(values);
      return Promise.resolve();
    }
    return apply(values);
  });

  if (actions.length === 0) {
    return (
      <Text size="sm" c="ink.6">
        {copy.noActions}
      </Text>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        {failure && (
          <Alert color="warn" radius="md" role="alert">
            {failure}
          </Alert>
        )}
        <Controller
          name="action"
          control={control}
          render={({ field, fieldState }) => (
            <Radio.Group
              label={copy.actionLabel}
              error={fieldState.error?.message}
              name={field.name}
              value={field.value ?? null}
              onChange={field.onChange}
              withAsterisk
            >
              <Stack gap="xs" mt="xs">
                {actions.map((action) => (
                  <Radio
                    key={action}
                    value={action}
                    label={copy.actions[MODERATION_ACTION_KEY[action]]}
                    description={copy.actionHelp[MODERATION_ACTION_KEY[action]]}
                  />
                ))}
              </Stack>
            </Radio.Group>
          )}
        />
        <Textarea
          label={copy.reasonLabel}
          placeholder={copy.reasonPlaceholder}
          autosize
          minRows={3}
          maxRows={8}
          radius="md"
          withAsterisk
          error={errors.reason?.message}
          {...register("reason")}
        />
        <Button type="submit" loading={applying} w="fit-content">
          {copy.submit}
        </Button>
      </Stack>
      <ConfirmModal
        opened={confirming !== null}
        title={copy.confirmRemove.title}
        body={copy.confirmRemove.body}
        confirmLabel={copy.confirmRemove.confirmLabel}
        cancelLabel={copy.confirmRemove.cancelLabel}
        danger
        loading={applying}
        onConfirm={() => confirming && void apply(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </form>
  );
}
