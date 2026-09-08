"use client";

import { Group, Menu, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { Check, Globe, Languages } from "lucide-react";
import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import classes from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  fullWidth?: boolean;
}

export function LanguageSwitcher({ fullWidth = false }: LanguageSwitcherProps) {
  const { setLanguage, isVi } = useLanguage();

  return (
    <Menu position="bottom-end" shadow="md" width={170} withinPortal>
      <Menu.Target>
        <Tooltip
          label={isVi ? "Đổi ngôn ngữ giao diện" : "Switch UI language"}
          withArrow
          position="bottom"
        >
          <UnstyledButton
            className={classes.trigger}
            style={fullWidth ? { width: "100%", justifyContent: "center" } : undefined}
            aria-label="Switch Language / Đổi ngôn ngữ"
          >
            <Languages size={15} strokeWidth={2.2} />
            <span className={classes.flag}>{isVi ? "🇻🇳" : "🇬🇧"}</span>
            <span className={classes.langText}>{isVi ? "VI" : "EN"}</span>
          </UnstyledButton>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group gap={6}>
            <Globe size={13} />
            <span>{isVi ? "Ngôn ngữ giao diện" : "Interface Language"}</span>
          </Group>
        </Menu.Label>

        <Menu.Item
          leftSection={<span className={classes.flag}>🇻🇳</span>}
          rightSection={isVi ? <Check size={14} color="var(--mantine-color-teal-6)" /> : null}
          onClick={() => setLanguage("vi")}
          className={isVi ? classes.menuItemActive : undefined}
        >
          <Text size="xs" fw={isVi ? 700 : 500}>
            Tiếng Việt (VI)
          </Text>
        </Menu.Item>

        <Menu.Item
          leftSection={<span className={classes.flag}>🇬🇧</span>}
          rightSection={!isVi ? <Check size={14} color="var(--mantine-color-teal-6)" /> : null}
          onClick={() => setLanguage("en")}
          className={!isVi ? classes.menuItemActive : undefined}
        >
          <Text size="xs" fw={!isVi ? 700 : 500}>
            English (EN)
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
