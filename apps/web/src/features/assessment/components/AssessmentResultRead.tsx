"use client";
import { Alert, Badge, Button, Group, Stack } from "@mantine/core";
import { useState } from "react";
import {
  useAssessmentNotificationsQuery,
  useAssessmentReadResultMutation,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

export function AssessmentResultRead({
  id,
  version,
}: {
  id: string;
  version: number;
}) {
  const { isVi } = useLanguage();
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState(false);
  const [read, { loading }] = useAssessmentReadResultMutation();
  const query = useAssessmentNotificationsQuery({
    fetchPolicy: "cache-and-network",
  });
  async function mark() {
    setError(false);
    try {
      const result = await read({ variables: { id, version } });
      if (!result.data?.readAssessmentResult) throw new Error("Missing result");
      setMarked(true);
      await query.refetch().catch(() => {});
    } catch {
      setError(true);
    }
  }
  return (
    <Stack gap="xs">
      <Group>
        <Badge variant="light">
          {isVi ? "Phiên bản kết quả" : "Result version"} {version}
        </Badge>
        <Button
          variant="light"
          loading={loading}
          disabled={marked}
          onClick={() => void mark()}
        >
          {marked
            ? isVi
              ? "Đã đánh dấu đã đọc"
              : "Marked as read"
            : isVi
              ? "Đánh dấu đã đọc"
              : "Mark as read"}
        </Button>
      </Group>
      {error && (
        <Alert color="orange">
          {isVi
            ? "Chưa đánh dấu được. Nếu điểm vừa thay đổi, tải lại để đọc phiên bản mới rồi thử lại."
            : "Could not mark as read. If the score changed, reload the current result and retry."}
        </Alert>
      )}
    </Stack>
  );
}
