import { Stack, router } from "expo-router";

import { SITTING_STATUS } from "@/features/fullTest/labels";
import { formatDateTime } from "@/features/shared/labels";
import { useFullTestLibraryQuery } from "@/lib/graphql/generated";
import { Badge, EmptyState, ListItem, Screen, Section } from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { colors } from "@/ui/theme";

export default function FullTestLibraryScreen() {
  const library = useFullTestLibraryQuery({ fetchPolicy: "cache-and-network" });

  return (
    <Screen
      refreshing={library.loading && Boolean(library.data)}
      onRefresh={() => void library.refetch()}
    >
      <Stack.Screen options={{ title: "IELTS Full Test" }} />
      <QueryView
        loading={library.loading}
        error={library.error}
        data={library.data}
        onRetry={() => void library.refetch()}
      >
        {(data) => (
          <>
            {data.myFullTestSittings.length > 0 ? (
              <Section title="Lượt thi của bạn">
                {data.myFullTestSittings.map((sitting) => (
                  <ListItem
                    key={sitting.id}
                    icon="trophy-outline"
                    iconColor={colors.accent}
                    title={sitting.title}
                    subtitle={`Bắt đầu ${formatDateTime(sitting.startedAt)}`}
                    right={
                      sitting.overallBand != null ? (
                        <Badge
                          label={`Band ${sitting.overallBand}`}
                          tone="success"
                        />
                      ) : (
                        <Badge
                          label={SITTING_STATUS[sitting.status].label}
                          tone={SITTING_STATUS[sitting.status].tone}
                        />
                      )
                    }
                    onPress={() =>
                      router.push({
                        pathname: "/exams/full-tests/sittings/[id]",
                        params: { id: sitting.id },
                      })
                    }
                  />
                ))}
              </Section>
            ) : null}
            <Section title="Bộ đề">
              {data.fullTests.length === 0 ? (
                <EmptyState
                  icon="trophy-outline"
                  title="Chưa có bộ IELTS Full Test"
                />
              ) : (
                data.fullTests.map((test) => (
                  <ListItem
                    key={test.id}
                    icon="document-text-outline"
                    title={test.title}
                    subtitle={[test.certificateVariant, test.description]
                      .filter(Boolean)
                      .join(" · ")}
                    onPress={() =>
                      router.push({
                        pathname: "/exams/full-tests/[id]",
                        params: { id: test.id },
                      })
                    }
                  />
                ))
              )}
            </Section>
          </>
        )}
      </QueryView>
    </Screen>
  );
}
