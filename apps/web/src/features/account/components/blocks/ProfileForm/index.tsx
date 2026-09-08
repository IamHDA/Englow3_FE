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
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { AtSign, Calendar, Mail, RotateCcw, Save, User } from "lucide-react";
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
  const { isVi, t } = useLanguage();
  const defaultValues: ProfileFormValues = {
    fullName: profile.fullName ?? "",
    displayName: profile.displayName ?? "",
    gender: profile.gender ?? null,
    birthDate: typeof profile.birthDate === "string" ? profile.birthDate : "",
  };

  const genderOptions = [
    { value: "MALE", label: isVi ? "Nam" : "Male" },
    { value: "FEMALE", label: isVi ? "Nữ" : "Female" },
    { value: "OTHER", label: isVi ? "Khác" : "Other" },
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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
          <Text size="sm" c="ink.6">
            {isVi
              ? "Cập nhật thông tin chi tiết của bạn để cá nhân hóa lộ trình học"
              : "Update your personal details to customize your learning journey"}
          </Text>
        </Stack>

        <Divider />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <TextInput
            {...register("fullName")}
            label={t.account.fullName}
            placeholder={isVi ? "Ví dụ: Nguyễn Văn A" : "e.g. John Doe"}
            required
            leftSection={<User size={16} aria-hidden="true" />}
            error={errors.fullName?.message}
            classNames={{ input: classes.input, label: classes.label }}
          />

          <TextInput
            {...register("displayName")}
            label={t.account.displayName}
            placeholder={isVi ? "Ví dụ: An Nguyen" : "e.g. jdoe"}
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
                placeholder={isVi ? "Chọn giới tính" : "Select gender"}
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
          description={
            isVi
              ? "Email dùng để đăng nhập và nhận thông báo, không thể thay đổi tại đây"
              : "Email is used for account login and notifications, cannot be edited here"
          }
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
            {isVi ? "Đặt lại" : "Reset"}
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
