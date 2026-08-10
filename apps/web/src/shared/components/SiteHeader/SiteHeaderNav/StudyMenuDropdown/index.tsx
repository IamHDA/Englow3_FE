"use client";

import { Center, Menu, SimpleGrid } from "@mantine/core";
import Link from "next/link";

import { studyLinks } from "@/shared/constants/navigation";

import classes from "./StudyMenuDropdown.module.css";

export function StudyMenuDropdown() {
  return (
    <Menu.Dropdown className={classes.dropdown}>
      <SimpleGrid cols={2} spacing={4}>
        {studyLinks.map(({ icon: Icon, ...link }) => (
          <Menu.Item
            key={link.href}
            component={Link}
            href={link.href}
            leftSection={
              <Center component="span" className={classes.iconTile}>
                <Icon aria-hidden="true" size={20} />
              </Center>
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
      </SimpleGrid>
    </Menu.Dropdown>
  );
}
