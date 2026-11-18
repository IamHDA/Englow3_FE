"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { Ban, Ellipsis } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

type BlockMenuProps = {
  /** Whose menu it is, so the button does not read the same on every row. */
  name: string;
  disabled: boolean;
  onBlock: () => void;
};

/** The "..." beside a button: where blocking lives, so it is never one slip away from "add friend". */
export function BlockMenu({ name, disabled, onBlock }: BlockMenuProps) {
  const labels = useLanguage().t.friends.actions;
  return (
    <Menu position="bottom-end" disabled={disabled}>
      <Menu.Target>
        <ActionIcon
          variant="default"
          size={36}
          aria-label={labels.moreFor.replace("{name}", () => name)}
          disabled={disabled}
        >
          <Ellipsis size={18} aria-hidden="true" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          color="warn"
          leftSection={<Ban size={16} aria-hidden="true" />}
          onClick={onBlock}
        >
          {labels.block}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
