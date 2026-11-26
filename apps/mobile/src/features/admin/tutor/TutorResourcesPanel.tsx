import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/errors";
import {
  useReviewTutorResourceMutation,
  useTutorResourcesQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Notice,
  Pager,
  Row,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

import {
  canEditResource,
  RESOURCE_STATUSES,
  TUTOR_ADMIN_ERRORS,
  TUTOR_STATUS_LABELS,
} from "./labels";

/**
 * The tutor's knowledge library. Staff write drafts and submit them; only
 * what an administrator publishes is quoted in answers. A published resource
 * is changed through a new version. As the web's resources tab.
 */
export function TutorResourcesPanel() {
  const { me } = useAuth();
  const admin = me?.role === "ADMIN";
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const resources = useTutorResourcesQuery({
    variables: { status, page },
    fetchPolicy: "cache-and-network",
  });
  const [review, state] = useReviewTutorResourceMutation();
  const [error, setError] = useState<string | null>(null);
  const prompt = usePrompt();

  async function act(id: string, action: string, note?: string) {
    if (state.loading) return null;
    setError(null);
    try {
      const result = await review({
        variables: { id, input: { action, ...(note ? { note } : {}) } },
      });
      await resources.refetch();
      return result.data?.reviewTutorResource ?? null;
    } catch (failure) {
      setError(errorMessage(failure, TUTOR_ADMIN_ERRORS));
      return null;
    }
  }

  async function decide(id: string, action: "REJECT" | "ARCHIVE") {
    const note = await prompt.ask({
      title: action === "REJECT" ? "Yêu cầu sửa" : "Thu hồi học liệu",
      message: "Ghi lý do quyết định.",
      multiline: true,
      confirmLabel: "Xác nhận",
    });
    if (note) await act(id, action, note);
  }

  return (
    <View>
      {prompt.element}
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <AppText variant="caption" tone="muted" style={{ flex: 1 }}>
          Chỉ học liệu đã được Admin duyệt và xuất bản mới được dùng trong câu
          trả lời AI.
        </AppText>
        <Button
          title="Soạn mới"
          size="sm"
          onPress={() => router.push("/admin/tutor-resources/new")}
        />
      </Row>
      <ChipRow>
        <Chip
          label="Tất cả"
          selected={status === ""}
          onPress={() => {
            setStatus("");
            setPage(0);
          }}
        />
        {RESOURCE_STATUSES.map((value) => (
          <Chip
            key={value}
            label={TUTOR_STATUS_LABELS[value] ?? value}
            selected={status === value}
            onPress={() => {
              setStatus(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      <Notice message={error} />
      <QueryView
        loading={resources.loading}
        error={resources.error}
        data={resources.data?.tutorResources}
        onRetry={() => void resources.refetch()}
        isEmpty={(data) => data.items.length === 0}
        empty={
          <EmptyState
            icon="book-outline"
            title="Chưa có học liệu phù hợp"
            message="Soạn học liệu đầu tiên để gửi duyệt."
          />
        }
      >
        {(data) => (
          <>
            {data.items.map((resource) => {
              const mine = admin || me?.id === resource.authorId;
              return (
                <Card key={resource.id} style={{ marginBottom: spacing.sm }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <AppText variant="label" style={{ flex: 1 }}>
                      {resource.title}
                    </AppText>
                    <Badge
                      label={`${TUTOR_STATUS_LABELS[resource.status] ?? resource.status} · v${resource.versionNumber}`}
                      tone={
                        resource.status === "PUBLISHED" ? "success" : "primary"
                      }
                    />
                  </Row>
                  {resource.reviewNote ? (
                    <Notice message={resource.reviewNote} />
                  ) : null}
                  <AppText
                    variant="caption"
                    tone="muted"
                    numberOfLines={3}
                    style={{ marginTop: spacing.xs }}
                  >
                    {resource.body}
                  </AppText>
                  <Row wrap gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                    <Button
                      title={
                        canEditResource(resource, me) ? "Mở và sửa" : "Đọc"
                      }
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        router.push({
                          pathname: "/admin/tutor-resources/[id]",
                          params: { id: resource.id },
                        })
                      }
                    />
                    {mine && resource.status === "DRAFT" ? (
                      <Button
                        title="Gửi duyệt"
                        size="sm"
                        disabled={state.loading}
                        onPress={() => void act(resource.id, "SUBMIT")}
                      />
                    ) : null}
                    {admin && resource.status === "SUBMITTED" ? (
                      <>
                        <Button
                          title="Duyệt và xuất bản"
                          size="sm"
                          disabled={state.loading}
                          onPress={() => void act(resource.id, "PUBLISH")}
                        />
                        <Button
                          title="Yêu cầu sửa"
                          size="sm"
                          variant="secondary"
                          disabled={state.loading}
                          onPress={() => void decide(resource.id, "REJECT")}
                        />
                      </>
                    ) : null}
                    {resource.status === "PUBLISHED" ? (
                      <>
                        <Button
                          title="Tạo phiên bản mới"
                          size="sm"
                          variant="secondary"
                          disabled={state.loading}
                          onPress={() =>
                            void act(resource.id, "REVISION").then(
                              (revision) => {
                                if (revision)
                                  router.push({
                                    pathname: "/admin/tutor-resources/[id]",
                                    params: { id: revision.id },
                                  });
                              },
                            )
                          }
                        />
                        {admin ? (
                          <Button
                            title="Thu hồi"
                            size="sm"
                            variant="danger"
                            disabled={state.loading}
                            onPress={() => void decide(resource.id, "ARCHIVE")}
                          />
                        ) : null}
                      </>
                    ) : null}
                  </Row>
                </Card>
              );
            })}
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </>
        )}
      </QueryView>
    </View>
  );
}
