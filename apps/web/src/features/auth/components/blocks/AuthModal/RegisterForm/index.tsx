"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Flex,
  NativeSelect,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  BIRTH_DAY_OPTIONS,
  BIRTH_YEAR_OPTIONS,
  getBirthMonthOptions,
  getGenderOptions,
} from "@/features/auth/constants/authOptions";
import { Gender } from "@/lib/graphql/generated";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/shared/hooks/useLanguage";

import classes from "../AuthModal.module.css";

function isValidCalendarDate(day: string, month: string, year: string) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    nickname: z
      .string()
      .regex(
        /^[a-zA-Z0-9_]{3,20}$/,
        "Nickname chỉ gồm chữ cái, số, dấu gạch dưới, 3–20 ký tự",
      ),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu cần ít nhất 1 chữ thường")
      .regex(/[^A-Za-z0-9]/, "Mật khẩu cần ít nhất 1 ký tự đặc biệt"),
    birthDay: z.string().min(1, "Vui lòng chọn ngày sinh"),
    birthMonth: z.string().min(1, "Vui lòng chọn tháng sinh"),
    birthYear: z.string().min(1, "Vui lòng chọn năm sinh"),
    gender: z.enum(Gender),
    acceptedTerms: z
      .boolean()
      .refine((v) => v, "Bạn cần đồng ý với điều khoản để tiếp tục"),
  })
  .refine(
    ({ birthDay, birthMonth, birthYear }) =>
      isValidCalendarDate(birthDay, birthMonth, birthYear),
    { message: "Ngày sinh không hợp lệ", path: ["birthDay"] },
  );

type RegisterValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  onSuccess: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const birthMonthOptions = getBirthMonthOptions(t);
  const genderOptions = getGenderOptions(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      email: "",
      password: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      gender: Gender.MALE,
      acceptedTerms: true,
    },
  });

  async function onSubmit(values: RegisterValues) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: values.fullName,
          display_name: values.nickname,
          birth_date: `${values.birthYear}-${values.birthMonth.padStart(2, "0")}-${values.birthDay.padStart(2, "0")}`,
          gender: values.gender,
        },
      },
    });
    if (error) {
      notifications.show({
        color: "warn",
        title: "Không thể tạo tài khoản",
        message: error.message,
      });
      return;
    }
    notifications.show({
      color: "green",
      title: "Kiểm tra email",
      message: "Chúng tôi đã gửi email xác nhận tới hộp thư của bạn.",
    });
    router.refresh();
    onSuccess();
  }

  return (
    <Flex
      component="form"
      direction="column"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      gap={18}
    >
      <SimpleGrid cols={2} spacing={14}>
        <TextInput
          {...register("fullName")}
          label={t.auth.fullNameLabel}
          placeholder={t.auth.fullNamePlaceholder}
          error={errors.fullName?.message}
          classNames={{ label: classes.label, input: classes.input }}
        />
        <TextInput
          {...register("nickname")}
          label={
            <>
              {t.auth.nicknameLabel}
              <span className={classes.labelHint}>{t.auth.nicknameHint}</span>
            </>
          }
          placeholder={t.auth.nicknamePlaceholder}
          error={errors.nickname?.message}
          classNames={{ label: classes.label, input: classes.input }}
        />
      </SimpleGrid>

      <TextInput
        {...register("email")}
        label={t.auth.emailLabel}
        placeholder={t.auth.emailPlaceholder}
        error={errors.email?.message}
        classNames={{ label: classes.label, input: classes.input }}
      />

      <PasswordInput
        {...register("password")}
        label={
          <>
            {t.auth.passwordLabel}
            <span className={classes.labelHint}>
              {t.auth.passwordRegisterHint}
            </span>
          </>
        }
        placeholder={t.auth.createPasswordPlaceholder}
        error={errors.password?.message}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )
        }
        classNames={{ label: classes.label, input: classes.input }}
      />

      <Stack gap={8}>
        <Text className={classes.label} component="span">
          {t.auth.birthDateLabel}
        </Text>
        <SimpleGrid cols={3} spacing={10}>
          <NativeSelect
            {...register("birthDay")}
            aria-label={`${t.auth.birthDateLabel} - ${t.auth.dayLabel}`}
            data={[{ value: "", label: t.auth.dayLabel }, ...BIRTH_DAY_OPTIONS]}
            error={!!errors.birthDay}
            classNames={{ input: classes.input }}
          />
          <NativeSelect
            {...register("birthMonth")}
            aria-label={`${t.auth.birthDateLabel} - ${t.auth.monthLabel}`}
            data={[{ value: "", label: t.auth.monthLabel }, ...birthMonthOptions]}
            error={!!errors.birthMonth}
            classNames={{ input: classes.input }}
          />
          <NativeSelect
            {...register("birthYear")}
            aria-label={`${t.auth.birthDateLabel} - ${t.auth.yearLabel}`}
            data={[{ value: "", label: t.auth.yearLabel }, ...BIRTH_YEAR_OPTIONS]}
            error={!!errors.birthYear}
            classNames={{ input: classes.input }}
          />
        </SimpleGrid>
        {errors.birthDay ? (
          <Text size="xs" c="warn.6">
            {errors.birthDay.message}
          </Text>
        ) : null}
      </Stack>

      <NativeSelect
        {...register("gender")}
        label={t.auth.genderLabel}
        data={genderOptions}
        classNames={{ label: classes.label, input: classes.input }}
      />

      <Checkbox
        {...register("acceptedTerms")}
        color="navy.9"
        error={errors.acceptedTerms?.message}
        label={
          <Text size="sm" c="ink.7" component="span">
            {t.auth.termsAgreementPre}{" "}
            <Text component="span" fw={600} c="navy.9">
              {t.auth.termsOfService}
            </Text>{" "}
            {t.auth.andWord}{" "}
            <Text component="span" fw={600} c="navy.9">
              {t.auth.privacyPolicy}
            </Text>
            {t.auth.termsAgreementPost ? ` ${t.auth.termsAgreementPost}` : "."}
          </Text>
        }
      />

      <Button
        type="submit"
        loading={isSubmitting}
        color="orange.5"
        radius={12}
        h={48}
        fz={16}
        fw={700}
      >
        {t.auth.createAccountSubmit}
      </Button>
    </Flex>
  );
}
