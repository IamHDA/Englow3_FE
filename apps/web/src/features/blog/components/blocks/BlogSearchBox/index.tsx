"use client";

import {
  CloseButton,
  Divider,
  Flex,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Search } from "lucide-react";
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  MIN_SEARCH_TERM_LENGTH,
  SUGGESTIONS_MAX_HEIGHT,
} from "../../../constants/blog";
import type { BlogSearchTerm } from "../../../hooks/useBlogSearchTerm";
import type {
  PersonSuggestionData,
  PostSuggestionData,
  SuggestionGroup,
} from "../../../types";

import { PeopleSuggestions } from "./PeopleSuggestions";
import { PostSuggestions } from "./PostSuggestions";
import { SearchSuggestionsSkeleton } from "./SearchSuggestionsSkeleton";

/** What marks a row of the dropdown the arrow keys step through. */
const RESULT_SELECTOR = "[data-result]";

type BlogSearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  /** What the box says of what was typed, and the term the groups below were looked up for. */
  status: BlogSearchTerm["status"];
  term: string | null;
  posts: SuggestionGroup<PostSuggestionData>;
  /** Null when the viewer has no people to look for (Staff and Admin): the group is not there at all. */
  people: SuggestionGroup<PersonSuggestionData> | null;
  /** "Xem tất cả" of the posts: the term becomes the list's own filter. */
  onViewAllPosts: (term: string) => void;
  /** "lg" in the grey panel; "md" for the compact copy beside the list and in the phone drawer. */
  size?: "lg" | "md";
  /**
   * Render the dropdown at the end of the page instead of under the box. The
   * compact copies need it: the column and the drawer they sit in scroll, and
   * would clip a dropdown drawn inside them.
   */
  portal?: boolean;
};

/**
 * The search box over the list. As you type, a dropdown shows the people whose
 * name matches (at most 3, with what each is to you) above the posts whose
 * title does (at most 8), both at once, each with how many there are and a way
 * to see them all. It scrolls inside a fixed height, shows a hint for too
 * little typed and says so when nothing matches. The links in it are reached
 * with Tab, or with the arrow keys from the box; Escape closes it.
 */
export function BlogSearchBox({
  value,
  onChange,
  status,
  term,
  posts,
  people,
  onViewAllPosts,
  size = "lg",
  portal = false,
}: BlogSearchBoxProps) {
  const { t } = useLanguage();
  const copy = t.blog.search;
  const resultsId = useId();
  const input = useRef<HTMLInputElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const opened = open && value.trim().length > 0;

  const viewAllPosts = (searched: string) => {
    onViewAllPosts(searched);
    setOpen(false);
  };

  const results = (): HTMLElement[] =>
    Array.from(
      dropdown.current?.querySelectorAll<HTMLElement>(RESULT_SELECTOR) ?? [],
    );

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      const first = results()[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === "Enter" && status === "ready" && term) {
      event.preventDefault();
      viewAllPosts(term);
    }
  };

  const onDropdownKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const rows = results();
    const at = rows.indexOf(document.activeElement as HTMLElement);
    if (at === -1) return;
    event.preventDefault();
    if (event.key === "ArrowDown") {
      rows[Math.min(at + 1, rows.length - 1)]?.focus();
    } else if (at === 0) {
      input.current?.focus();
    } else {
      rows[at - 1]?.focus();
    }
  };

  const groups = [people, posts].filter((group) => group !== null);
  const waiting =
    status === "typing" || groups.some((group) => group.status === "loading");
  const everyGroupEmpty = groups.every(
    (group) => group.status === "ready" && group.items.length === 0,
  );

  let body: ReactNode;
  if (status === "tooShort") {
    body = (
      <Text c="ink.6" p="sm">
        {copy.tooShort.replace("{min}", String(MIN_SEARCH_TERM_LENGTH))}
      </Text>
    );
  } else if (waiting) {
    body = <SearchSuggestionsSkeleton showPeople={people !== null} />;
  } else if (everyGroupEmpty) {
    body = (
      <Stack gap={4} p="sm">
        <Text fw={600} c="navy.9">
          {copy.emptyTitle.replace("{q}", value.trim())}
        </Text>
        <Text size="sm" c="ink.6">
          {copy.emptyHint}
        </Text>
      </Stack>
    );
  } else {
    // A group is left out when it answered with nothing, and stays - with its
    // error - when it failed, so a failing half is not mistaken for no results.
    const showPeople =
      people !== null && !(people.status === "ready" && !people.items.length);
    const showPosts = !(posts.status === "ready" && !posts.items.length);
    body = (
      <ScrollArea.Autosize
        mah={SUGGESTIONS_MAX_HEIGHT}
        type="auto"
        scrollbars="y"
        overscrollBehavior="contain"
      >
        <Stack gap={4}>
          {people && showPeople && (
            <PeopleSuggestions
              group={people}
              term={term ?? value.trim()}
              onNavigate={() => setOpen(false)}
            />
          )}
          {showPeople && showPosts && <Divider />}
          {showPosts && (
            <PostSuggestions
              group={posts}
              onViewAll={() => viewAllPosts(term ?? value.trim())}
              onNavigate={() => setOpen(false)}
            />
          )}
        </Stack>
      </ScrollArea.Autosize>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpen}
      position="bottom-start"
      width="target"
      offset={8}
      radius="lg"
      shadow="lg"
      trapFocus={false}
      returnFocus={false}
      withinPortal={portal}
    >
      <Popover.Target>
        <TextInput
          ref={input}
          value={value}
          onChange={(event) => {
            onChange(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          size={size}
          radius="lg"
          aria-label={copy.label}
          aria-controls={opened ? resultsId : undefined}
          placeholder={copy.placeholder}
          autoComplete="off"
          leftSection={<Search size={18} aria-hidden="true" />}
          rightSection={
            value ? (
              <CloseButton
                aria-label={copy.clear}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  input.current?.focus();
                }}
              />
            ) : null
          }
        />
      </Popover.Target>
      <Popover.Dropdown
        id={resultsId}
        ref={dropdown}
        role="region"
        aria-label={copy.resultsLabel}
        p="xs"
        onKeyDown={onDropdownKeyDown}
      >
        <Flex direction="column">{body}</Flex>
      </Popover.Dropdown>
    </Popover>
  );
}
