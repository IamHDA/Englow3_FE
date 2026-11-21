import { Box, Flex, Paper } from "@mantine/core";
import type { ReactNode } from "react";

type FriendsLayoutProps = {
  /** The search box and the menu of lists. */
  sidebar: ReactNode;
  /** The list, or what a search found. */
  children: ReactNode;
};

/**
 * Two columns: the side menu on the left, the list taking the rest. Below the
 * medium breakpoint the menu stacks above the list at the full width.
 * Shared by the page and its skeleton, so the two cannot drift apart.
 */
export function FriendsLayout({ sidebar, children }: FriendsLayoutProps) {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align={{ base: "stretch", md: "flex-start" }}
      gap="lg"
    >
      <Paper
        component="aside"
        withBorder
        p="md"
        flex="none"
        w={{ base: "100%", md: 280 }}
      >
        {sidebar}
      </Paper>
      <Box
        flex={{ base: "none", md: 1 }}
        miw={0}
        w={{ base: "100%", md: "auto" }}
      >
        {children}
      </Box>
    </Flex>
  );
}
