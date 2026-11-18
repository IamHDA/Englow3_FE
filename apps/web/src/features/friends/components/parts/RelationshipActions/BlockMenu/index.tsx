"use client";

import { ActionIcon, Menu } from "@mantine/core";
import { Ban, Ellipsis } from "lucide-react";

import { ACTION_LABELS } from "../../../../constants/friends";

type BlockMenuProps = {
  disabled: boolean;
  onBlock: () => void;
};

/** The "..." beside a button: where blocking lives, so it is never one slip away from "add friend". */
export function BlockMenu({ disabled, onBlock }: BlockMenuProps) {
  return (
    <Menu position="bottom-end" disabled={disabled}>
      <Menu.Target>
        <ActionIcon
          variant="default"
          size={36}
          aria-label={ACTION_LABELS.more}
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
          {ACTION_LABELS.block}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
