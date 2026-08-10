"use client";

import { Menu, UnstyledButton } from "@mantine/core";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/features/auth/signIn";

import classes from "./AccountMenu.module.css";

type AccountMenuProps = {
  name: string;
  fullWidth?: boolean;
};

export function AccountMenu({ name, fullWidth }: AccountMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.refresh();
  };

  return (
    <Menu position="bottom-end" offset={8} width={200} withinPortal>
      <Menu.Target>
        <UnstyledButton
          className={fullWidth ? classes.triggerFullWidth : classes.trigger}
          // Starts with the visible text so the accessible name matches what
          // is on screen (WCAG "label in name").
          aria-label={`Hi ${name}, open account menu`}
        >
          <span className={classes.greeting}>
            Hi <span className={classes.name}>{name}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            size={16}
            strokeWidth={2.75}
            className={classes.chevron}
          />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<LogOut aria-hidden="true" size={16} />}
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Logging out…" : "Log out"}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
