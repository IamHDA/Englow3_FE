"use client";

import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { isBackOfficeRole, useAuth } from "@/features/auth";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  AccountApiError,
  eraseAccount,
  fetchExport,
} from "../../../api/accountApi";

import classes from "./ProfileDataCard.module.css";

const copy = {
  vi: {
    title: "Dữ liệu và tài khoản",
    description:
      "Bạn sở hữu dữ liệu học của mình: tải về một bản sao hoặc xoá hẳn tài khoản bất cứ lúc nào.",
    export: "Tải dữ liệu của tôi",
    exportHint:
      "Một tệp JSON gồm hồ sơ, bài thi, bài chấm, thẻ học và hội thoại.",
    exporting: "Đang tổng hợp dữ liệu…",
    exported: "Đã tải dữ liệu của bạn",
    exportFailed: "Không tải được dữ liệu. Thử lại sau ít phút.",
    erase: "Xoá tài khoản",
    eraseHint:
      "Xoá vĩnh viễn tài khoản và toàn bộ dữ liệu học. Không thể khôi phục.",
    modalTitle: "Xoá tài khoản vĩnh viễn?",
    willDelete: "Sẽ bị xoá ngay và không thể khôi phục:",
    items: [
      "Hồ sơ, mục tiêu và ảnh đại diện",
      "Kết quả bài thi, bài chấm Writing và Speaking, bản ghi âm",
      "Thẻ ghi nhớ, tiến độ chép chính tả và bài kiểm tra",
      "Hội thoại với gia sư AI và gói đang dùng (nếu có)",
    ],
    typeEmail: (email: string) => `Nhập ${email} để xác nhận`,
    emailLabel: "Email của tài khoản",
    cancel: "Giữ tài khoản",
    confirm: "Xoá vĩnh viễn",
    erased: "Tài khoản đã được xoá",
    errors: {
      ACCOUNT_AI_WORK_PENDING:
        "Một yêu cầu AI của bạn vẫn đang chạy. Thử lại sau vài phút.",
      ACCOUNT_CONFIRMATION_MISMATCH: "Email nhập vào không khớp với tài khoản.",
      ACCOUNT_ERASURE_NOT_SELF_SERVICE:
        "Tài khoản quản trị và biên tập do quản trị viên xoá.",
      RATE_LIMITED: "Bạn thử quá nhiều lần. Đợi một lúc rồi thử lại.",
      default: "Không xoá được tài khoản. Thử lại sau ít phút.",
    } as Record<string, string>,
    policy: "Chính sách bảo mật",
  },
  en: {
    title: "Data and account",
    description:
      "Your learning data is yours: download a copy or delete the account at any time.",
    export: "Download my data",
    exportHint:
      "One JSON file with your profile, exams, marked work, cards and conversations.",
    exporting: "Gathering your data…",
    exported: "Your data has been downloaded",
    exportFailed: "Could not download your data. Try again in a few minutes.",
    erase: "Delete account",
    eraseHint:
      "Permanently deletes the account and all learning data. It cannot be undone.",
    modalTitle: "Delete your account permanently?",
    willDelete: "This is deleted at once and cannot be recovered:",
    items: [
      "Your profile, goals and avatar",
      "Exam results, Writing and Speaking marking, recordings",
      "Flashcards, dictation progress and quizzes",
      "AI tutor conversations and your current plan, if any",
    ],
    typeEmail: (email: string) => `Type ${email} to confirm`,
    emailLabel: "Account email",
    cancel: "Keep my account",
    confirm: "Delete permanently",
    erased: "Your account has been deleted",
    errors: {
      ACCOUNT_AI_WORK_PENDING:
        "An AI request of yours is still running. Try again in a few minutes.",
      ACCOUNT_CONFIRMATION_MISMATCH: "That email does not match this account.",
      ACCOUNT_ERASURE_NOT_SELF_SERVICE:
        "Staff and administrator accounts are deleted by an administrator.",
      RATE_LIMITED: "Too many attempts. Wait a while and try again.",
      default: "Could not delete the account. Try again in a few minutes.",
    } as Record<string, string>,
    policy: "Privacy policy",
  },
} as const;

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Download a copy of the account's data, or delete the account. */
export function ProfileDataCard({ email }: { email: string }) {
  const { language } = useLanguage();
  const c = copy[language];
  // Staff own published content, so their removal is an administrator's call and the button would only fail.
  const { session } = useAuth();
  const canErase = !isBackOfficeRole(session?.role);
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [erasing, setErasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setExporting(true);
    try {
      saveFile(await fetchExport(), "englow3-my-data.json");
      notifications.show({ color: "teal", message: c.exported });
    } catch (failure) {
      const limited =
        failure instanceof AccountApiError && failure.code === "RATE_LIMITED";
      notifications.show({
        color: "warn",
        message: limited ? c.errors.RATE_LIMITED : c.exportFailed,
      });
    } finally {
      setExporting(false);
    }
  }

  async function erase() {
    setErasing(true);
    setError(null);
    try {
      await eraseAccount(typed.trim());
      notifications.show({ color: "teal", message: c.erased });
      // A full navigation, not a router push: every provider above this page
      // still believes someone is signed in, and a fresh load is what drops it.
      window.location.href = window.location.origin;
    } catch (failure) {
      const code =
        failure instanceof AccountApiError ? failure.code : "default";
      setError(c.errors[code] ?? c.errors.default);
      setErasing(false);
    }
  }

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  return (
    <Paper radius="lg" withBorder p="xl" className={classes.paper}>
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon color="navy.9" variant="light" size="lg" radius="md">
            <ShieldAlert size={20} />
          </ThemeIcon>
          <Title order={3} fz={18} fw={700} c="ink.9">
            {c.title}
          </Title>
        </Group>
        <Text size="sm" c="ink.7">
          {c.description}{" "}
          <Link href="/privacy" className={classes.link}>
            {c.policy}
          </Link>
        </Text>

        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Stack gap={2} maw={420}>
            <Text fw={600} size="sm">
              {c.export}
            </Text>
            <Text size="xs" c="ink.6">
              {c.exportHint}
            </Text>
          </Stack>
          <Button
            variant="light"
            color="navy"
            radius="md"
            leftSection={<Download size={16} />}
            loading={exporting}
            onClick={() => void download()}
          >
            {exporting ? c.exporting : c.export}
          </Button>
        </Group>

        {canErase ? (
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Stack gap={2} maw={420}>
              <Text fw={600} size="sm" c="red.8">
                {c.erase}
              </Text>
              <Text size="xs" c="ink.6">
                {c.eraseHint}
              </Text>
            </Stack>
            <Button
              variant="outline"
              color="red"
              radius="md"
              leftSection={<Trash2 size={16} />}
              onClick={() => {
                setTyped("");
                setError(null);
                setOpen(true);
              }}
            >
              {c.erase}
            </Button>
          </Group>
        ) : (
          <Text size="xs" c="ink.6">
            {c.errors.ACCOUNT_ERASURE_NOT_SELF_SERVICE}
          </Text>
        )}
      </Stack>

      <Modal
        opened={open}
        onClose={() => (erasing ? undefined : setOpen(false))}
        title={c.modalTitle}
        centered
        closeOnClickOutside={!erasing}
      >
        <Stack gap="md">
          <Text size="sm">{c.willDelete}</Text>
          <List size="sm" spacing={4}>
            {c.items.map((item) => (
              <List.Item key={item}>{item}</List.Item>
            ))}
          </List>
          <TextInput
            label={c.emailLabel}
            description={c.typeEmail(email)}
            value={typed}
            onChange={(event) => setTyped(event.currentTarget.value)}
            autoComplete="off"
            disabled={erasing}
          />
          {error && (
            <Alert color="red" variant="light" role="alert">
              {error}
            </Alert>
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setOpen(false)}
              disabled={erasing}
            >
              {c.cancel}
            </Button>
            <Button
              color="red"
              disabled={!matches}
              loading={erasing}
              onClick={() => void erase()}
            >
              {c.confirm}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}
