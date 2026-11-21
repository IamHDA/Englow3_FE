"use client";

import { Badge, Flex, NavLink } from "@mantine/core";

import { useLanguage } from "@/shared/hooks/useLanguage";

import {
  FRIENDS_SECTIONS,
  REQUEST_BADGE_MAX,
  type FriendsSection,
} from "../../../../constants/friends";
import { FRIENDS_SECTION_ICONS } from "../../../../constants/friendsSections";

import classes from "./FriendsNav.module.css";

type FriendsNavProps = {
  /** The list on show, or null while search results take its place: no entry is lit then. */
  active: FriendsSection | null;
  /** How many requests wait for an answer: the number beside "Lời mời nhận được". */
  waiting: number;
  onSelect: (section: FriendsSection) => void;
};

/**
 * The menu of /friends: its four lists, one tall row each. Only the requests
 * received carry a number - the others are counted in the heading of the list
 * itself, once it is open.
 */
export function FriendsNav({ active, waiting, onSelect }: FriendsNavProps) {
  const copy = useLanguage().t.friends;
  return (
    <Flex component="nav" aria-label={copy.navLabel} direction="column" gap={4}>
      {FRIENDS_SECTIONS.map((section) => {
        const Icon = FRIENDS_SECTION_ICONS[section];
        const current = active === section;
        return (
          <NavLink
            key={section}
            // A button, not the link NavLink makes by default: a link with no
            // address cannot take focus, and nothing here navigates.
            component="button"
            classNames={{ root: classes.link, label: classes.label }}
            active={current}
            aria-current={current ? "true" : undefined}
            label={copy.sections[section]}
            leftSection={<Icon size={20} aria-hidden="true" />}
            rightSection={
              section === "requests" && waiting > 0 ? (
                <Badge color="orange" variant="filled">
                  {waiting > REQUEST_BADGE_MAX
                    ? `${REQUEST_BADGE_MAX}+`
                    : waiting}
                </Badge>
              ) : undefined
            }
            onClick={() => onSelect(section)}
          />
        );
      })}
    </Flex>
  );
}
