import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  canEditResource,
  TUTOR_ADMIN_ERRORS,
  TUTOR_STATUS_LABELS,
} from "@/features/admin/tutor/labels";
import { errorMessage } from "@/lib/errors";
import {
  useCreateTutorResourceMutation,
  useTutorResourceQuery,
  useUpdateTutorResourceMutation,
  type TutorResourceQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Notice,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

type Resource = TutorResourceQuery["tutorResource"];

/** Writes or reads one knowledge-library resource. `new` creates a draft. */
export default function TutorResourceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const creating = id === "new";
  const query = useTutorResourceQuery({
    variables: { id },
    skip: creating,
    fetchPolicy: "network-only",
  });

  if (creating) return <ResourceForm resource={null} />;
  return (
    <Screen>
      <Stack.Screen options={{ title: "Học liệu" }} />
      <QueryView
        loading={query.loading}
        error={query.error}
        data={query.data?.tutorResource}
        onRetry={() => void query.refetch()}
      >
        {(resource) => (
          <ResourceForm key={resource.rowVersion} resource={resource} />
        )}
      </QueryView>
    </Screen>
  );
}

function ResourceForm({ resource }: { resource: Resource | null }) {
  const { me } = useAuth();
  const [title, setTitle] = useState(resource?.title ?? "");
  const [body, setBody] = useState(resource?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [create, created] = useCreateTutorResourceMutation({
    refetchQueries: ["TutorResources"],
  });
  const [update, updated] = useUpdateTutorResourceMutation({
    refetchQueries: ["TutorResources"],
  });
  const editable = resource === null || canEditResource(resource, me);
  const busy = created.loading || updated.loading;

  async function save() {
    if (busy) return;
    setError(null);
    try {
      if (resource === null)
        await create({
          variables: { input: { title: title.trim(), body, rowVersion: 0 } },
        });
      else
        await update({
          variables: {
            id: resource.id,
            input: {
              title: title.trim(),
              body,
              rowVersion: resource.rowVersion,
            },
          },
        });
      router.back();
    } catch (failure) {
      setError(
        errorMessage(failure, TUTOR_ADMIN_ERRORS) +
          " Nội dung đang nhập vẫn được giữ.",
      );
    }
  }

  const form = (
    <>
      <Stack.Screen
        options={{ title: resource === null ? "Soạn học liệu" : "Học liệu" }}
      />
      {resource ? (
        <Badge
          label={`${TUTOR_STATUS_LABELS[resource.status] ?? resource.status} · v${resource.versionNumber}`}
        />
      ) : null}
      {resource?.reviewNote ? <Notice message={resource.reviewNote} /> : null}
      <TextField
        label="Tiêu đề"
        value={title}
        onChangeText={setTitle}
        maxLength={200}
        editable={editable && !busy}
      />
      <TextField
        label="Nội dung và ví dụ"
        value={body}
        onChangeText={setBody}
        maxLength={12_000}
        multiline
        editable={editable && !busy}
        style={{ minHeight: 260 }}
      />
      <AppText
        variant="caption"
        tone="muted"
        style={{ marginBottom: spacing.md }}
      >
        Dùng nội dung bạn được phép sử dụng. Không đưa thông tin cá nhân hoặc
        đáp án đề thi chưa công bố vào đây.
      </AppText>
      <Notice message={error} />
      {editable ? (
        <Button
          title="Lưu bản nháp"
          loading={busy}
          disabled={!title.trim() || !body.trim()}
          onPress={() => void save()}
        />
      ) : (
        <AppText variant="caption" tone="muted">
          Học liệu này chỉ đọc. Học liệu đã xuất bản cần tạo phiên bản mới để
          sửa.
        </AppText>
      )}
    </>
  );

  return resource === null ? <Screen>{form}</Screen> : form;
}
