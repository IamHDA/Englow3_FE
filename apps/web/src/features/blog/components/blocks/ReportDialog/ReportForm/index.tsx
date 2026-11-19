"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Group,
  Radio,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import {
  BACKEND_CODES,
  MAX_REPORT_DETAIL_LENGTH,
} from "../../../../constants/blog";
import { sentenceForCode } from "../../../../constants/blogErrors";
import {
  REPORT_REASONS,
  REPORT_REASON_KEY,
} from "../../../../constants/blogLabels";
import {
  createReportSchema,
  type ReportFormValues,
} from "../../../../schemas/report";

type ReportFormProps = {
  onSubmit: (values: {
    reason: ReportFormValues["reason"];
    detail: string | null;
  }) => Promise<void>;
  onClose: () => void;
};

/**
 * The form of a report: a reason (required) and a note of at most 500
 * characters (optional - a blank one is none). React Hook Form with a Zod rule.
 */
export function ReportForm({ onSubmit, onClose }: ReportFormProps) {
  const { t } = useLanguage();
  const copy = t.blog.report;
  const schema = useMemo(
    () =>
      createReportSchema({
        reasonRequired: copy.reasonRequired,
        detailTooLong: copy.detailTooLong.replace(
          "{max}",
          String(MAX_REPORT_DETAIL_LENGTH),
        ),
      }),
    [copy.reasonRequired, copy.detailTooLong],
  );
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { detail: "" },
  });
  const [failure, setFailure] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSubmit({
        reason: values.reason,
        detail: values.detail.trim() || null,
      });
      onClose();
    } catch (error) {
      const code = backendCodeOf(error);
      const sentence = sentenceForCode(t.blog, code);
      if (code === BACKEND_CODES.reportDetailTooLong) {
        setError("detail", { type: "server", message: sentence });
      } else {
        setFailure(sentence);
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="md">
        <Text size="sm" c="ink.6">
          {copy.description}
        </Text>
        {failure && (
          <Alert color="warn" radius="md" role="alert">
            {failure}
          </Alert>
        )}
        <Controller
          name="reason"
          control={control}
          render={({ field, fieldState }) => (
            <Radio.Group
              label={copy.reasonLabel}
              error={fieldState.error?.message}
              name={field.name}
              value={field.value ?? null}
              onChange={field.onChange}
              withAsterisk
            >
              <Stack gap="xs" mt="xs">
                {REPORT_REASONS.map((reason) => (
                  <Radio
                    key={reason}
                    value={reason}
                    label={t.blog.reportReasons[REPORT_REASON_KEY[reason]]}
                  />
                ))}
              </Stack>
            </Radio.Group>
          )}
        />
        <Textarea
          label={copy.detailLabel}
          placeholder={copy.detailPlaceholder}
          autosize
          minRows={2}
          maxRows={6}
          radius="md"
          error={errors.detail?.message}
          {...register("detail")}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            {copy.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {copy.submit}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
