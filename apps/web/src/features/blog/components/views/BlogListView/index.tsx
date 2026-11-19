"use client";

import {
  Button,
  Group,
  Select,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { FileText, PenLine, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { BlogPostSort } from "@/lib/graphql/generated";
import {
  useBlogPostsQuery,
  useBlogTagCatalogueQuery,
} from "@/lib/graphql/generated/hooks";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  BLOG_ROUTES,
  MIN_SEARCH_TERM_LENGTH,
  POSTS_PAGE_SIZE,
} from "../../../constants/blog";
import type { BlogListFilters } from "../../../hooks/blogFilters";
import { useBlogListFilters } from "../../../hooks/useBlogListFilters";
import { useBlogSearchTerm } from "../../../hooks/useBlogSearchTerm";
import { PostList } from "../../blocks/PostList";
import { PostListSkeleton } from "../../blocks/PostList/PostListSkeleton";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";
import { tagLabel } from "../../parts/TagBadges";

import classes from "./BlogListView.module.css";

/**
 * /blog: the posts of everyone, newest first or most liked, narrowed by a word
 * in the title and by skill, level and certificate. The filters live in the
 * address, so a link to a filtered list can be shared; the search waits for a
 * pause in typing and never asks below the two characters the backend takes.
 * While another page or filter loads, the list on screen stays - dimmed - rather
 * than being replaced by a skeleton and jumping.
 */
export function BlogListView({ initial }: { initial: BlogListFilters }) {
  const { t } = useLanguage();
  const copy = t.blog.list;
  const { filters, setFilter, setPage, clear, narrowed } =
    useBlogListFilters(initial);
  const search = useBlogSearchTerm(filters.q);

  const catalogue = useBlogTagCatalogueQuery({ fetchPolicy: "cache-first" });
  const { data, previousData, loading, error, refetch } = useBlogPostsQuery({
    variables: {
      q: search.term,
      skill: filters.skill,
      level: filters.level,
      certificate: filters.certificate,
      sort: filters.sort,
      page: filters.page - 1,
      size: POSTS_PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const posts = (data ?? previousData)?.blogPosts;
  const retry = () => void refetch().catch(() => undefined);

  const options = useMemo(() => {
    const words = catalogue.data?.blogTagCatalogue;
    const toOptions = (values: string[] | undefined) =>
      (values ?? []).map((value) => ({
        value,
        label: tagLabel(t.blog, value),
      }));
    return {
      skills: toOptions(words?.skills),
      levels: toOptions(words?.levels),
      certificates: toOptions(words?.certificates),
    };
  }, [catalogue.data, t.blog]);

  let list;
  if (posts && posts.items.length > 0) {
    list = (
      <Stack gap="lg" className={classes.results} aria-busy={loading}>
        <PostList posts={posts.items} />
        <BlogPagination
          page={filters.page}
          totalPages={posts.totalPages}
          onChange={(next) => {
            setPage(next);
            window.scrollTo({ top: 0 });
          }}
        />
      </Stack>
    );
  } else if (posts) {
    list = (
      <BlogEmptyState
        icon={<FileText size={24} aria-hidden="true" />}
        title={copy.emptyTitle}
        description={copy.emptyDescription}
        action={
          narrowed ? (
            <Button variant="light" onClick={clear}>
              {copy.filters.clear}
            </Button>
          ) : (
            <Button
              component={Link}
              href={BLOG_ROUTES.write}
              leftSection={<PenLine size={16} aria-hidden="true" />}
            >
              {copy.write}
            </Button>
          )
        }
      />
    );
  } else if (error) {
    list = (
      <Stack gap="sm">
        <BlogLoadError
          title={copy.loadErrorTitle}
          description={copy.loadErrorDescription}
          retryLabel={copy.retry}
          onRetry={retry}
        />
        {narrowed && (
          <Button variant="subtle" onClick={clear} w="fit-content">
            {copy.filters.clear}
          </Button>
        )}
      </Stack>
    );
  } else {
    list = <PostListSkeleton count={POSTS_PAGE_SIZE / 2} />;
  }

  return (
    <>
      <PageHeader
        title={t.blog.title}
        actions={
          <Button
            component={Link}
            href={BLOG_ROUTES.write}
            fullWidth
            leftSection={<PenLine size={16} aria-hidden="true" />}
          >
            {copy.write}
          </Button>
        }
      />
      <Text c="ink.6" maw={560}>
        {copy.subtitle}
      </Text>

      <Stack gap="sm" component="search" aria-label={copy.search.label}>
        <TextInput
          value={filters.q}
          onChange={(event) => setFilter({ q: event.currentTarget.value })}
          aria-label={copy.search.label}
          placeholder={copy.search.placeholder}
          leftSection={<Search size={16} aria-hidden="true" />}
          error={
            search.status === "tooShort"
              ? copy.search.tooShort.replace(
                  "{min}",
                  String(MIN_SEARCH_TERM_LENGTH),
                )
              : undefined
          }
        />
        {catalogue.loading && !catalogue.data ? (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <Skeleton height={36} radius="md" />
            <Skeleton height={36} radius="md" />
            <Skeleton height={36} radius="md" />
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <Select
              aria-label={copy.filters.skill}
              placeholder={`${copy.filters.skill}: ${copy.filters.any}`}
              data={options.skills}
              value={filters.skill}
              onChange={(skill) => setFilter({ skill })}
              clearable
            />
            <Select
              aria-label={copy.filters.level}
              placeholder={`${copy.filters.level}: ${copy.filters.any}`}
              data={options.levels}
              value={filters.level}
              onChange={(level) => setFilter({ level })}
              clearable
            />
            <Select
              aria-label={copy.filters.certificate}
              placeholder={`${copy.filters.certificate}: ${copy.filters.any}`}
              data={options.certificates}
              value={filters.certificate}
              onChange={(certificate) => setFilter({ certificate })}
              clearable
            />
          </SimpleGrid>
        )}
        <Group justify="space-between" gap="sm">
          <SegmentedControl
            aria-label={copy.filters.sort}
            value={filters.sort}
            onChange={(sort) =>
              setFilter({
                sort:
                  sort === BlogPostSort.MOST_LIKED
                    ? BlogPostSort.MOST_LIKED
                    : BlogPostSort.NEWEST,
              })
            }
            data={[
              { value: BlogPostSort.NEWEST, label: copy.filters.newest },
              { value: BlogPostSort.MOST_LIKED, label: copy.filters.mostLiked },
            ]}
          />
          {narrowed && (
            <Button variant="subtle" size="compact-md" onClick={clear}>
              {copy.filters.clear}
            </Button>
          )}
        </Group>
      </Stack>

      {list}
    </>
  );
}
