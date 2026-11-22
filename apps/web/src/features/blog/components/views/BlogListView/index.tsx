"use client";

import { Box, Button, Flex, Group, Paper, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FileText, PenLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuth, isBackOfficeRole } from "@/features/auth";
import {
  useBlogRecommendationsQuery,
  useBlogPostsQuery,
  useBlogSavedCountQuery,
  useBlogTagCatalogueQuery,
} from "@/lib/graphql/generated/hooks";
import { PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  BLOG_ROUTES,
  MIN_SEARCH_TERM_LENGTH,
  POSTS_PAGE_SIZE,
  RECOMMENDED_POSTS,
} from "../../../constants/blog";
import type { BlogListFilters } from "../../../hooks/blogFilters";
import { useBlogErrorMessage } from "../../../hooks/useBlogErrorMessage";
import { useBlogListFilters } from "../../../hooks/useBlogListFilters";
import { useBlogSave } from "../../../hooks/useBlogSave";
import { useBlogSearchSuggestions } from "../../../hooks/useBlogSearchSuggestions";
import { useBlogSearchTerm } from "../../../hooks/useBlogSearchTerm";
import { BlogSearchBox } from "../../blocks/BlogSearchBox";
import { ListFilters } from "../../blocks/ListFilters";
import { MobileListTools } from "../../blocks/MobileListTools";
import { PostRowList } from "../../blocks/PostRowList";
import { PostRowListSkeleton } from "../../blocks/PostRowList/PostRowListSkeleton";
import { RecommendedPosts } from "../../blocks/RecommendedPosts";
import { RecommendedPostsSkeleton } from "../../blocks/RecommendedPosts/RecommendedPostsSkeleton";
import { TopicChips } from "../../blocks/TopicChips";
import { BlogEmptyState } from "../../parts/BlogEmptyState";
import { BlogLoadError } from "../../parts/BlogLoadError";
import { BlogPagination } from "../../parts/BlogPagination";
import { SavedPostsButton } from "../../parts/SavedPostsButton";

import classes from "./BlogListView.module.css";

/** What a save changes the answer of on this screen: the count on the button, and the recommendations, which leave out what is saved. */
const SAVE_REFETCH = ["BlogSavedCount", "BlogRecommendations"];

/**
 * /blog: a grey panel at the top with the search, the saved posts and the
 * recommendations for the viewer, and below it the posts of everyone - by
 * topic (a skill), newest or most liked, and by level and certificate - one
 * line each, with a bookmark. Once the panel is scrolled away, its search and
 * buttons come back in the column beside the list, which stays in view (on a
 * phone: in a drawer behind a floating button). The filters live in the address, so a link to a
 * filtered list can be shared. Typing in the search box only opens its
 * dropdown; "Xem tất cả" is what puts the word in the list's filter. While
 * another page or filter loads, the list on screen stays - dimmed - rather than
 * being replaced by a skeleton and jumping.
 */
export function BlogListView({ initial }: { initial: BlogListFilters }) {
  const { t } = useLanguage();
  const copy = t.blog.list;
  const { session } = useAuth();
  const messageFor = useBlogErrorMessage();
  const { filters, setFilter, setPage, clear, narrowed } =
    useBlogListFilters(initial);

  // What is typed in the box, apart from the word the list is filtered by.
  const [typed, setTyped] = useState(filters.q);
  const search = useBlogSearchTerm(typed);
  // Staff and Admin are not learners: the backend refuses the people search.
  const suggestions = useBlogSearchSuggestions(
    search.term,
    !isBackOfficeRole(session?.role),
  );

  const catalogue = useBlogTagCatalogueQuery({ fetchPolicy: "cache-first" });
  const filteredBy = filters.q.trim();
  const { data, previousData, loading, error, refetch } = useBlogPostsQuery({
    variables: {
      q: filteredBy.length >= MIN_SEARCH_TERM_LENGTH ? filteredBy : null,
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
  const recommendations = useBlogRecommendationsQuery({
    variables: { limit: RECOMMENDED_POSTS },
    fetchPolicy: "cache-and-network",
  });
  const savedCount = useBlogSavedCountQuery({
    fetchPolicy: "cache-and-network",
  });
  const save = useBlogSave({
    refetch: SAVE_REFETCH,
    onError: (failure) =>
      notifications.show({
        color: "warn",
        title: t.blog.actionErrorTitle,
        message: messageFor(failure),
      }),
  });

  // Whether the grey panel's search and buttons are on screen. Until the
  // observer has answered they count as on screen, so nothing flashes in.
  const { ref: toolbarRef, entry: toolbarEntry } =
    useIntersection<HTMLDivElement>();
  const toolbarInView = toolbarEntry?.isIntersecting ?? true;

  const posts = (data ?? previousData)?.blogPosts;
  const retry = () => void refetch().catch(() => undefined);
  const words = catalogue.data?.blogTagCatalogue;
  const savedTotal = savedCount.data?.savedBlogPosts.totalItems;

  const clearAll = () => {
    clear();
    setTyped("");
  };
  const clearSearch = () => {
    setFilter({ q: "" });
    setTyped("");
  };

  const searchBox = (compact: boolean) => (
    <BlogSearchBox
      value={typed}
      onChange={setTyped}
      status={search.status}
      term={search.term}
      posts={suggestions.posts}
      people={suggestions.people}
      onViewAllPosts={(term) => setFilter({ q: term })}
      size={compact ? "md" : "lg"}
      portal={compact}
    />
  );
  const writeButton = (size: "lg" | "sm") => (
    <Button
      component={Link}
      href={BLOG_ROUTES.write}
      size={size}
      leftSection={
        <PenLine size={size === "lg" ? 18 : 16} aria-hidden="true" />
      }
    >
      {copy.write}
    </Button>
  );
  const filterColumn = (
    <ListFilters
      sort={filters.sort}
      onSort={(sort) => setFilter({ sort })}
      levels={words?.levels ?? null}
      level={filters.level}
      onLevel={(level) => setFilter({ level })}
      certificates={words?.certificates ?? null}
      certificate={filters.certificate}
      onCertificate={(certificate) => setFilter({ certificate })}
      narrowed={narrowed}
      onClear={clearAll}
    />
  );
  // The panel's tools again, compact: beside the list on a wide screen and in
  // the phone drawer, once the panel itself is scrolled away.
  const shortcuts = (
    <Group gap="xs" grow>
      {writeButton("sm")}
      <SavedPostsButton total={savedTotal} size="sm" />
    </Group>
  );

  let list;
  if (posts && posts.items.length > 0) {
    list = (
      <Stack gap="lg" className={classes.results} aria-busy={loading}>
        <PostRowList
          posts={posts.items}
          savingId={save.pendingId}
          onToggleSave={(post) => void save.toggle(post)}
        />
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
            <Button variant="light" onClick={clearAll}>
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
      <BlogLoadError
        title={copy.loadErrorTitle}
        description={copy.loadErrorDescription}
        retryLabel={copy.retry}
        onRetry={retry}
      />
    );
  } else {
    list = <PostRowListSkeleton count={POSTS_PAGE_SIZE / 2} />;
  }

  let recommended;
  if (recommendations.data) {
    recommended = (
      <RecommendedPosts
        recommendations={recommendations.data.blogRecommendations}
        savingId={save.pendingId}
        onToggleSave={(post) => void save.toggle(post)}
      />
    );
  } else if (recommendations.error) {
    recommended = (
      <Flex gap="sm" align="center" wrap="wrap">
        <Text c="ink.6">{t.blog.recommended.loadError}</Text>
        <Button
          variant="subtle"
          size="compact-md"
          onClick={() => void recommendations.refetch().catch(() => undefined)}
        >
          {t.blog.recommended.retry}
        </Button>
      </Flex>
    );
  } else {
    recommended = <RecommendedPostsSkeleton />;
  }

  return (
    <>
      <Paper bg="ink.0" withBorder className={classes.hero}>
        <Stack gap="lg">
          <Stack gap={6}>
            <PageHeader title={t.blog.title} />
            <Text c="ink.6" maw={560}>
              {copy.subtitle}
            </Text>
          </Stack>

          <Flex
            ref={toolbarRef}
            component="search"
            gap="sm"
            wrap="wrap"
            align="center"
          >
            <Box flex="1 1 360px" miw={0}>
              {searchBox(false)}
            </Box>
            <SavedPostsButton total={savedTotal} size="lg" />
            {writeButton("lg")}
          </Flex>

          {recommended}
        </Stack>
      </Paper>

      <TopicChips
        skills={words?.skills ?? []}
        value={filters.skill}
        onChange={(skill) => setFilter({ skill })}
      />

      <Flex
        direction={{ base: "column", md: "row-reverse" }}
        gap={{ base: "xl", md: 48 }}
        align={{ md: "flex-start" }}
      >
        <Box
          w={{ base: "100%", md: 280 }}
          flex="none"
          className={classes.aside}
        >
          <Stack gap="xl">
            {!toolbarInView && <Box visibleFrom="md">{searchBox(true)}</Box>}
            {filterColumn}
            {!toolbarInView && <Box visibleFrom="md">{shortcuts}</Box>}
          </Stack>
        </Box>

        <Stack gap="sm" flex={1} miw={0}>
          <Flex gap="sm" wrap="wrap" align="center">
            <Text component="h2" fz="xl" fw={600} c="navy.9" ff="heading" m={0}>
              {filteredBy
                ? copy.resultsFor.replace("{q}", filteredBy)
                : copy.allPosts}
            </Text>
            {filteredBy && (
              <Button
                variant="default"
                size="compact-md"
                radius="xl"
                onClick={clearSearch}
              >
                {copy.clearSearch} ×
              </Button>
            )}
          </Flex>
          {list}
        </Stack>
      </Flex>

      <MobileListTools visible={!toolbarInView}>
        <Stack gap="xl" pb="md">
          {searchBox(true)}
          {filterColumn}
          {shortcuts}
        </Stack>
      </MobileListTools>
    </>
  );
}
