"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { AtSign, Calendar, Mail, RotateCcw, Save, User } from "lucide-react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import type { AccountProfile } from "../../../types";
import { profileFormSchema, type ProfileFormValues } from "./schema";

import classes from "./ProfileForm.module.css";

import { useLanguage } from "@/shared/hooks/useLanguage";

type ProfileFormProps = {
  profile: NonNullable<AccountProfile>;
  isSubmitting: boolean;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
};

export function ProfileForm({
  profile,
  isSubmitting,
  onSubmit,
}: ProfileFormProps) {
  const { t, isVi } = useLanguage();
  const defaultValues: ProfileFormValues = {
    fullName: profile.fullName ?? "",
    displayName: profile.displayName ?? "",
    gender: profile.gender ?? null,
    birthDate: typeof profile.birthDate === "string" ? profile.birthDate : "",
  };

  const schema = useMemo(() => profileFormSchema(isVi), [isVi]);

  const genderOptions = [
    { value: "MALE", label: t.account.male },
    { value: "FEMALE", label: t.account.female },
    { value: "OTHER", label: t.account.otherGender },
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function handleReset() {
    reset(defaultValues);
  }

  const handleValidSubmit = async (values: ProfileFormValues) => {
    await onSubmit(values);
  };

  return (
    <Paper radius="lg" withBorder p="xl" className={classes.formPaper}>
      <Flex
        component="form"
        direction="column"
        gap="lg"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(handleValidSubmit)(e);
        }}
        noValidate
      >
        <Stack gap={4}>
          <Title order={3} fz={20} fw={700} c="ink.9">
            {t.account.personalInfoTab}
          </Title>
        </Stack>

        <Divider />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <TextInput
            {...register("fullName")}
            label={t.account.fullName}
            placeholder={t.account.fullNamePlaceholder}
            required
            leftSection={<User size={16} aria-hidden="true" />}
            error={errors.fullName?.message}
            classNames={{ input: classes.input, label: classes.label }}
          />

          <TextInput
            {...register("displayName")}
            label={t.account.displayName}
            placeholder={t.account.displayNamePlaceholder}
            required
            leftSection={<AtSign size={16} aria-hidden="true" />}
            error={errors.displayName?.message}
            classNames={{ input: classes.input, label: classes.label }}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                label={t.account.gender}
                placeholder={t.account.selectGenderPlaceholder}
                data={genderOptions}
                value={field.value ?? null}
                onChange={(val) => field.onChange(val || null)}
                clearable
                error={errors.gender?.message}
                classNames={{ input: classes.input, label: classes.label }}
              />
            )}
          />

          <TextInput
            {...register("birthDate")}
            type="date"
            label={t.account.birthDate}
            leftSection={<Calendar size={16} aria-hidden="true" />}
            error={errors.birthDate?.message}
            classNames={{ input: classes.input, label: classes.label }}
          />
        </SimpleGrid>

        <TextInput
          label={t.account.email}
          value={profile.email}
          disabled
          leftSection={<Mail size={16} aria-hidden="true" />}
          description={t.account.emailFieldDescription}
          classNames={{ input: classes.input, label: classes.label }}
        />

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button
            type="button"
            variant="default"
            radius="md"
            h={42}
            px="lg"
            leftSection={<RotateCcw size={16} aria-hidden="true" />}
            disabled={!isDirty || isSubmitting}
            onClick={handleReset}
          >
            {t.common.reset}
          </Button>

          <Button
            type="submit"
            color="orange.5"
            radius="md"
            h={42}
            px="xl"
            fw={700}
            leftSection={<Save size={16} aria-hidden="true" />}
            loading={isSubmitting}
            disabled={!isDirty}
          >
            {t.account.saveChanges}
          </Button>
        </Group>
      </Flex>
    </Paper>
  );
}
