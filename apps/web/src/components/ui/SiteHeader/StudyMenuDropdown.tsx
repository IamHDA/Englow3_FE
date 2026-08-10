"use client";

import { Menu } from "@mantine/core";
import Link from "next/link";

import { studyLinks } from "./navigation";
import classes from "./StudyMenuDropdown.module.css";

export function StudyMenuDropdown() {
  return (
    <Menu.Dropdown className={classes.dropdown}>
      <div className={classes.grid}>
        {studyLinks.map(({ icon: Icon, ...link }) => (
          <Menu.Item
            key={link.href}
            component={Link}
            href={link.href}
            leftSection={
              <span className={classes.iconTile}>
                <Icon aria-hidden="true" size={20} />
              </span>
            }
            classNames={{
              item: classes.item,
              itemLabel: classes.itemLabel,
              itemSection: classes.itemSection,
            }}
          >
            <span className={classes.label}>{link.label}</span>
            <span className={classes.description}>{link.description}</span>
          </Menu.Item>
        ))}
      </div>
    </Menu.Dropdown>
  );
}
