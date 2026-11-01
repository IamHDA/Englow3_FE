"use client";

import {
  Button,
  Group,
  Loader,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Languages, ListChecks, Search } from "lucide-react";
import { useState } from "react";

// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useTranslationSetsQuery } from "@/lib/graphql/generated/hooks";
import { paginationControlProps } from "@/shared/a11y/paginationControls";
import { LibraryCard } from "@/shared/components/LibraryCard";
import { LoadErrorState } from "@/shared/components/LoadErrorState";
import { Page } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

const PAGE_SIZE = 12;

export function TranslationLibraryView() {
  const { isVi } = useLanguage();
  const t = (vi: string, en: string) => (isVi ? vi : en);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const query = useTranslationSetsQuery({
    variables: { title: title || null, page: page - 1, size: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });
  const sets = query.data?.translationSets.items ?? [];
  const totalPages = query.data?.translationSets.totalPages ?? 0;

  return (
    <Page>
      <Stack gap="lg">
        <div>
          <Group gap="xs">
            <Languages size={28} aria-hidden />
            <Title order={1}>
              {t("Luyện dịch Việt → Anh", "Vietnamese → English")}
            </Title>
          </Group>
          <Text c="dimmed" mt={4}>
            {t(
              "Dịch từng câu tiếng Việt sang tiếng Anh. AI chấm theo ý nghĩa, ngữ pháp, từ vựng và độ tự nhiên, chỉ ra lỗi và gợi ý câu hay hơn.",
              "Translate each Vietnamese sentence into English. AI grades meaning, grammar, vocabulary and naturalness, points out mistakes and suggests a better sentence.",
            )}
          </Text>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setTitle(draft.trim());
          }}
        >
          <Group gap="xs" align="flex-end">
            <TextInput
              flex={1}
              maw={420}
              label={t("Tìm bộ câu", "Find a set")}
              placeholder={t("Tên bộ câu", "Set title")}
              leftSection={<Search size={16} aria-hidden />}
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
            />
            <Button type="submit" variant="light">
              {t("Tìm", "Search")}
            </Button>
          </Group>
        </form>

        {query.error && sets.length === 0 ? (
          <LoadErrorState
            error={query.error}
            thing={{ vi: "bộ câu luyện dịch", en: "translation sets" }}
            back={{ href: "/", label: t("Trang chủ", "Home") }}
            onRetry={() => void query.refetch().catch(() => {})}
          />
        ) : query.loading && sets.length === 0 ? (
          <Loader />
        ) : sets.length === 0 ? (
          <Text c="dimmed">
            {title
              ? t("Không có bộ câu nào khớp.", "No set matches.")
              : t(
                  "Chưa có bộ câu nào được xuất bản.",
                  "No set has been published yet.",
                )}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {sets.map((set) => {
              const started = set.gradedCount > 0;
              const done =
                set.itemCount > 0 && set.gradedCount >= set.itemCount;
              return (
                <LibraryCard
                  key={set.id}
                  eyebrow={set.topic}
                  level={set.targetLevel}
                  title={set.title}
                  status={
                    done
                      ? { label: t("Đã xong", "Done"), color: "teal" }
                      : undefined
                  }
                  meta={[
                    {
                      icon: <ListChecks size={14} aria-hidden />,
                      label: t(
                        `${set.itemCount} câu`,
                        `${set.itemCount} sentences`,
                      ),
                    },
                  ]}
                  progress={
                    set.itemCount > 0
                      ? {
                          value: (set.gradedCount / set.itemCount) * 100,
                          label: t(
                            `Đã dịch ${set.gradedCount}/${set.itemCount}`,
                            `${set.gradedCount}/${set.itemCount} translated`,
                          ),
                        }
                      : undefined
                  }
                  action={{
                    label: started
                      ? t("Tiếp tục", "Continue")
                      : t("Luyện ngay", "Start"),
                    href: `/study/translation/${set.id}`,
                    emphasis: started && !done ? "continue" : "default",
                  }}
                />
              );
            })}
          </SimpleGrid>
        )}

        {totalPages > 1 && (
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            getControlProps={paginationControlProps(isVi)}
          />
        )}
      </Stack>
    </Page>
  );
}
