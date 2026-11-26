import { Stack, router, useLocalSearchParams } from "expo-router";

import { errorMessage } from "@/lib/errors";
import {
  FullTestSittingStatus,
  useFullTestLibraryQuery,
  useStartFullTestMutation,
} from "@/lib/graphql/generated";
import {
  AppText,
  Button,
  Card,
  EmptyState,
  Notice,
  Screen,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

const START_ERRORS: Record<string, string> = {
  FULL_TEST_NOT_FOUND: "Không tìm thấy bộ đề này.",
  FULL_TEST_NOT_PUBLISHED: "Bộ đề này chưa được xuất bản.",
};

/** Start a full test, or go back to the sitting already open for it. */
export default function FullTestStartScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const library = useFullTestLibraryQuery({ fetchPolicy: "cache-and-network" });
  const [start, startState] = useStartFullTestMutation();

  return (
    <Screen>
      <QueryView
        loading={library.loading}
        error={library.error}
        data={library.data}
        onRetry={() => void library.refetch()}
      >
        {(data) => {
          const test = data.fullTests.find((item) => item.id === id);
          if (!test) return <EmptyState title="Không tìm thấy bộ đề này" />;
          const open = data.myFullTestSittings.find(
            (sitting) =>
              sitting.fullTestId === id &&
              sitting.status === FullTestSittingStatus.IN_PROGRESS,
          );
          return (
            <>
              <Stack.Screen options={{ title: test.title }} />
              <Card style={{ marginBottom: spacing.lg }}>
                <AppText variant="heading">{test.title}</AppText>
                {test.description ? (
                  <AppText tone="muted">{test.description}</AppText>
                ) : null}
                <AppText style={{ marginTop: spacing.md }}>
                  Gồm Nghe và Đọc (một bài thi tính giờ), 2 bài Viết và 3 phần
                  Nói. Bạn có thể làm từng phần trong hạn của lượt thi; band
                  tổng có khi đủ 4 kỹ năng.
                </AppText>
              </Card>
              <Notice
                message={
                  startState.error
                    ? errorMessage(startState.error, START_ERRORS)
                    : null
                }
              />
              {open ? (
                <Button
                  title="Tiếp tục lượt đang làm"
                  icon="play"
                  onPress={() =>
                    router.replace({
                      pathname: "/exams/full-tests/sittings/[id]",
                      params: { id: open.id },
                    })
                  }
                />
              ) : (
                <Button
                  title="Bắt đầu Full Test"
                  icon="play"
                  loading={startState.loading}
                  onPress={() =>
                    void start({ variables: { fullTestId: id } })
                      .then(({ data: started }) => {
                        if (started) {
                          router.replace({
                            pathname: "/exams/full-tests/sittings/[id]",
                            params: { id: started.startFullTest.id },
                          });
                        }
                      })
                      .catch(() => undefined)
                  }
                />
              )}
            </>
          );
        }}
      </QueryView>
    </Screen>
  );
}
