"use client";

import { Affix, Button, Drawer, Transition } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

/** Space between the floating button and the corner of the screen. */
const CORNER_OFFSET = 20;

type MobileListToolsProps = {
  /** Whether the button is offered: only once the grey panel's own search is scrolled away. */
  visible: boolean;
  /** The search, the filters and the shortcuts, as the drawer shows them. */
  children: ReactNode;
};

/**
 * On a phone the column beside the list sits under it, so nothing there can
 * stay in view. Instead a floating "Tìm và lọc" button, once the top of the
 * page is scrolled away, opens the same tools in a drawer from the bottom.
 * Hidden from the medium breakpoint up, where the column itself stays in view.
 */
export function MobileListTools({ visible, children }: MobileListToolsProps) {
  const copy = useLanguage().t.blog.list.tools;
  const [opened, drawer] = useDisclosure(false);

  return (
    <>
      <Affix
        position={{ bottom: CORNER_OFFSET, right: CORNER_OFFSET }}
        hiddenFrom="md"
      >
        <Transition mounted={visible} transition="slide-up" duration={150}>
          {(styles) => (
            <Button
              style={styles}
              size="md"
              radius="xl"
              leftSection={<SlidersHorizontal size={18} aria-hidden="true" />}
              aria-haspopup="dialog"
              onClick={drawer.open}
            >
              {copy.open}
            </Button>
          )}
        </Transition>
      </Affix>
      <Drawer
        opened={opened}
        onClose={drawer.close}
        position="bottom"
        size="auto"
        radius="lg"
        title={copy.title}
        hiddenFrom="md"
      >
        {children}
      </Drawer>
    </>
  );
}
