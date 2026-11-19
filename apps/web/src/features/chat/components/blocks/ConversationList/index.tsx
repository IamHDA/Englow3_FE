"use client";

import {
  Button,
  Group,
  Pagination,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { MessageCircle, Users } from "lucide-react";
import Link from "next/link";

import { paginationControlProps } from "@/shared/a11y/paginationControls";
import { useLanguage } from "@/shared/hooks/useLanguage";

import type { ConversationItem } from "../../../types";
import { ChatEmptyState } from "../ChatEmptyState";

import classes from "./ConversationList.module.css";
import { ConversationRow } from "./ConversationRow";

type ConversationListProps = {
  items: ConversationItem[];
  /** The open conversation, to mark in the list. */
  selectedId: string | null;
  meId: string;
  /** Counted from 1. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/** The viewer's conversations, newest first, each a link to its own page. A page heading over them: this is what /chat is. */
export function ConversationList({
  items,
  selectedId,
  meId,
  page,
  totalPages,
  onPageChange,
}: ConversationListProps) {
  const { isVi, t } = useLanguage();
  const copy = t.chat.list;

  return (
    <Stack gap={0} h="100%">
      <Group px="md" py="sm" className={classes.header}>
        <MessageCircle size={20} aria-hidden="true" />
        <Title order={1} fz={20} fw={700} c="navy.9">
          {copy.heading}
        </Title>
      </Group>
      {items.length === 0 ? (
        <ChatEmptyState
          icon={<MessageCircle size={24} aria-hidden="true" />}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
          action={
            <Button
              component={Link}
              href="/friends"
              variant="light"
              leftSection={<Users size={16} aria-hidden="true" />}
            >
              {copy.emptyAction}
            </Button>
          }
        />
      ) : (
        <ScrollArea flex={1} mih={0}>
          <nav aria-label={copy.heading}>
            {items.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                meId={meId}
                selected={conversation.id === selectedId}
              />
            ))}
          </nav>
        </ScrollArea>
      )}
      {totalPages > 1 && (
        <Group justify="center" p="sm">
          <Pagination
            size="sm"
            value={page}
            onChange={onPageChange}
            total={totalPages}
            getControlProps={paginationControlProps(isVi)}
          />
        </Group>
      )}
    </Stack>
  );
}
