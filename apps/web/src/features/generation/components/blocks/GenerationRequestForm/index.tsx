"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Group, Text, Textarea } from "@mantine/core";
import { Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { BRIEF_MAX_LENGTH } from "../../../constants/generation";
import {
  generationRequestSchema,
  type GenerationRequestValues,
} from "./schema";

export type { GenerationRequestValues } from "./schema";

/**
 * "Generate an IELTS set", with an optional brief. The limits (three a day,
 * one at a time) are the backend's; the button only reflects them.
 */
export function GenerationRequestForm({
  remaining,
  limit,
  inProgress,
  submitting,
  onSubmit,
}: {
  remaining: number;
  limit: number;
  inProgress: boolean;
  submitting: boolean;
  onSubmit: (values: GenerationRequestValues) => Promise<boolean>;
}) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const schema = useMemo(() => generationRequestSchema(isVi), [isVi]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<GenerationRequestValues>({
    resolver: zodResolver(schema),
    defaultValues: { brief: "" },
  });
  const brief = useWatch({ control, name: "brief" }) ?? "";
  const blocked = remaining <= 0 || inProgress;

  return (
    <Flex
      component="form"
      direction="column"
      gap="sm"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(async (values) => {
          if (await onSubmit(values)) reset({ brief: "" });
        })(event);
      }}
    >
      <Textarea
        label={tr("Yêu cầu riêng (không bắt buộc)", "Your brief (optional)")}
        description={tr(
          "Ví dụ: chủ đề khoa học và môi trường, khó hơn B2, nhiều câu ghép. Để trống thì AI tạo theo mặc định. Luật cấu trúc đề IELTS vẫn áp dụng.",
          "For example: science and environment topics, harder than B2, more matching questions. Leave it empty for the default. The IELTS structure rules still apply.",
        )}
        autosize
        minRows={3}
        maxLength={BRIEF_MAX_LENGTH}
        disabled={submitting}
        error={errors.brief?.message}
        {...register("brief")}
      />
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          {tr(
            `Còn ${remaining}/${limit} lượt hôm nay · ${brief.length}/${BRIEF_MAX_LENGTH} ký tự`,
            `${remaining} of ${limit} left today · ${brief.length}/${BRIEF_MAX_LENGTH} characters`,
          )}
        </Text>
        <Button
          type="submit"
          leftSection={<Sparkles size={16} />}
          loading={submitting}
          disabled={blocked}
        >
          {tr("Tạo bộ đề IELTS", "Generate an IELTS set")}
        </Button>
      </Group>
      {inProgress && (
        <Text size="sm" c="dimmed">
          {tr(
            "Bạn đang có một lượt chưa xong; đợi nó xong rồi tạo tiếp.",
            "One of your requests is still running; wait for it to finish.",
          )}
        </Text>
      )}
    </Flex>
  );
}
