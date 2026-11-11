"use client";

import { Alert, Button, Card, Modal, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { RejectExamModal } from "@/features/exam";
import { CertificateVariant, Role } from "@/lib/graphql/generated/schemaTypes";
import type { AdminFullTestFieldsFragment } from "@/lib/graphql/generated/documents";
import {
  useAdminFullTestsQuery,
  useApproveFullTestMutation,
  useArchiveFullTestMutation,
  useCurrentUserQuery,
  useFullTestComponentsQuery,
  useRejectFullTestMutation,
  useSaveFullTestMutation,
  useSubmitFullTestForReviewMutation,
} from "@/lib/graphql/generated/hooks";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";
import { FULL_TEST_ERROR_COPY } from "../../../constants/fullTest";
import {
  AdminFullTestTable,
  type FullTestAction,
} from "../../blocks/AdminFullTestTable";
import { AdminFullTestTableSkeleton } from "../../blocks/AdminFullTestTable/AdminFullTestTableSkeleton";
import {
  FullTestForm,
  type FullTestFormValues,
} from "../../blocks/FullTestForm";

const EMPTY_FORM: FullTestFormValues = {
  title: "",
  description: "",
  certificateVariant: CertificateVariant.ACADEMIC,
  examId: "",
  writingTask1Id: "",
  writingTask2Id: "",
  speakingPart1Id: "",
  speakingPart2Id: "",
  speakingPart3Id: "",
};

function formOf(fullTest: AdminFullTestFieldsFragment): FullTestFormValues {
  return {
    title: fullTest.title,
    description: fullTest.description,
    certificateVariant:
      fullTest.certificateVariant === CertificateVariant.GENERAL
        ? CertificateVariant.GENERAL
        : CertificateVariant.ACADEMIC,
    examId: fullTest.examId,
    writingTask1Id: fullTest.writingTask1Id,
    writingTask2Id: fullTest.writingTask2Id,
    speakingPart1Id: fullTest.speakingPart1Id,
    speakingPart2Id: fullTest.speakingPart2Id,
    speakingPart3Id: fullTest.speakingPart3Id,
  };
}

/** The form is open for a new full test (null id) or for an existing one. */
type Editing = {
  id: string | null;
  version: number | null;
  values: FullTestFormValues;
};

export function AdminFullTestListView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const { data, loading, error, refetch } = useAdminFullTestsQuery({
    fetchPolicy: "cache-and-network",
  });
  const { data: meData } = useCurrentUserQuery();
  // Only drawn for the buttons; the backend still checks the role itself.
  const canReview = meData?.me.role === Role.ADMIN;
  const [editing, setEditing] = useState<Editing | null>(null);
  const components = useFullTestComponentsQuery({
    skip: editing === null,
    fetchPolicy: "cache-and-network",
  });
  const [rejecting, setRejecting] =
    useState<AdminFullTestFieldsFragment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);

  const [save] = useSaveFullTestMutation();
  const [submit] = useSubmitFullTestForReviewMutation();
  const [approve] = useApproveFullTestMutation();
  const [reject] = useRejectFullTestMutation();
  const [archive] = useArchiveFullTestMutation();

  function failure(cause: unknown) {
    const copy = FULL_TEST_ERROR_COPY[backendCodeOf(cause) ?? ""];
    notifications.show({
      color: "red",
      message: copy
        ? isVi
          ? copy.vi
          : copy.en
        : tr(
            "Chưa thực hiện được. Hãy tải lại trang và thử lại.",
            "That did not go through. Reload the page and try again.",
          ),
    });
  }

  async function run(
    id: string,
    action: () => Promise<unknown>,
    done: string,
  ): Promise<boolean> {
    if (pending.current) return false;
    pending.current = true;
    setBusyId(id);
    try {
      await action();
      notifications.show({ color: "green", message: done });
      await refetch().catch(() => undefined);
      return true;
    } catch (cause) {
      failure(cause);
      return false;
    } finally {
      pending.current = false;
      setBusyId(null);
    }
  }

  function handleAction(
    action: FullTestAction,
    fullTest: AdminFullTestFieldsFragment,
  ) {
    const variables = { id: fullTest.id };
    switch (action) {
      case "edit":
        setEditing({
          id: fullTest.id,
          version: fullTest.version,
          values: formOf(fullTest),
        });
        return;
      case "submit":
        void run(
          fullTest.id,
          () => submit({ variables }),
          tr("Đã gửi duyệt.", "Sent for review."),
        );
        return;
      case "approve":
        void run(
          fullTest.id,
          () => approve({ variables }),
          tr("Đã phát hành full test.", "Full test published."),
        );
        return;
      case "reject":
        setRejecting(fullTest);
        return;
      case "archive":
        if (
          window.confirm(
            tr(
              "Lưu trữ full test này? Người học sẽ không bắt đầu được nữa.",
              "Archive this full test? Learners can no longer start it.",
            ),
          )
        )
          void run(
            fullTest.id,
            () => archive({ variables }),
            tr("Đã lưu trữ.", "Archived."),
          );
        return;
    }
  }

  async function handleSave(values: FullTestFormValues) {
    if (!editing || pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      await save({
        variables: {
          id: editing.id,
          input: { ...values, version: editing.version },
        },
      });
      notifications.show({
        color: "green",
        message: tr("Đã lưu bản nháp.", "Draft saved."),
      });
      setEditing(null);
      await refetch().catch(() => undefined);
    } catch (cause) {
      failure(cause);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  const fullTests = data?.adminFullTests ?? [];
  return (
    <Page>
      <Stack gap="lg">
        <PageHeader
          title={tr("Full test IELTS", "IELTS full tests")}
          actions={
            <Button
              leftSection={<Plus size={16} />}
              onClick={() =>
                setEditing({ id: null, version: null, values: EMPTY_FORM })
              }
            >
              {tr("Tạo full test", "New full test")}
            </Button>
          }
        />
        <Text size="sm" c="dimmed">
          {tr(
            "Một full test gồm một đề Listening + Reading và năm đề Writing/Speaking đã phát hành. Đây là bài test đầu vào của học viên IELTS.",
            "A full test is one Listening + Reading paper and five published Writing and Speaking tasks. It is the IELTS learner's placement test.",
          )}
        </Text>
        {error && !data ? (
          <Alert color="red">
            {tr(
              "Không tải được danh sách full test.",
              "The full tests could not be loaded.",
            )}
          </Alert>
        ) : loading && !data ? (
          <AdminFullTestTableSkeleton />
        ) : fullTests.length === 0 ? (
          <Card withBorder radius="lg" p="xl">
            <Text c="dimmed" ta="center">
              {tr("Chưa có full test nào.", "No full tests yet.")}
            </Text>
          </Card>
        ) : (
          <Card withBorder radius="lg" p={0}>
            <AdminFullTestTable
              fullTests={fullTests}
              canReview={canReview}
              busyId={busyId}
              onAction={handleAction}
            />
          </Card>
        )}
      </Stack>
      <Modal
        opened={editing !== null}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
        title={
          editing?.id
            ? tr("Sửa full test", "Edit full test")
            : tr("Tạo full test", "New full test")
        }
        size="xl"
        radius="lg"
      >
        {editing && (
          <Stack gap="md">
            {components.error && (
              <Alert color="orange">
                {tr(
                  "Không tải được danh sách đề để chọn. Đóng và mở lại.",
                  "The papers and tasks could not be loaded. Close and reopen.",
                )}
              </Alert>
            )}
            <FullTestForm
              key={editing.id ?? "new"}
              initial={editing.values}
              components={components.data}
              submitting={saving}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </Stack>
        )}
      </Modal>
      <RejectExamModal
        examTitle={rejecting?.title ?? null}
        submitting={busyId !== null}
        onCancel={() => setRejecting(null)}
        onConfirm={async (note) => {
          if (!rejecting) return false;
          const ok = await run(
            rejecting.id,
            () => reject({ variables: { id: rejecting.id, note } }),
            tr("Đã trả lại.", "Returned."),
          );
          if (ok) setRejecting(null);
          return ok;
        }}
      />
    </Page>
  );
}
