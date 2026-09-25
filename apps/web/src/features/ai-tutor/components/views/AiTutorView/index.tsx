"use client";

import {
  Alert,
  Button,
  Card,
  Grid,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React, { useEffect, useRef } from "react";

import {
  useReportTutorMessageMutation,
  useTutorConversationsQuery,
} from "@/lib/graphql/generated/hooks";

import { TutorComposer } from "../../blocks/TutorComposer";
import { TutorConversationList } from "../../blocks/TutorConversationList";
import { TutorMessageBubble } from "../../blocks/TutorMessageBubble";
import { TutorStarters } from "../../blocks/TutorStarters";
import { useTutorChat } from "../../../hooks/useTutorChat";
import { Page, PageHeader } from "@/shared/components/Page";

export function AiTutorView() {
  const {
    conversationId,
    messages,
    sending,
    waiting,
    error,
    send,
    open,
    reset,
  } = useTutorChat();

  const {
    data,
    loading: conversationsLoading,
    refetch,
  } = useTutorConversationsQuery({
    fetchPolicy: "cache-and-network",
  });
  const [reportMessage] = useReportTutorMessageMutation();

  const bottom = useRef<HTMLDivElement>(null);

  // Cuộn xuống khi có lượt mới, nếu không thì câu trả lời vừa về nằm ngoài
  // màn hình và người học tưởng là chưa có gì.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, waiting]);

  // Danh sách bên trái chỉ đổi khi một cuộc trò chuyện mới được mở, nên chỉ
  // hỏi lại lúc đó thay vì hỏi theo mỗi lượt.
  useEffect(() => {
    if (conversationId) {
      void refetch();
    }
  }, [conversationId, refetch]);

  async function handleReport(messageId: string) {
    if (!conversationId) return;
    await reportMessage({ variables: { conversationId, messageId } });
    await open(conversationId);
  }

  return (
    <Page>
      <Stack gap="lg">
        <PageHeader
          title="Gia sư AI"
          actions={
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={reset}
              fullWidth
            >
              Cuộc trò chuyện mới
            </Button>
          }
        />

        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card withBorder radius="md" p="xs">
              <TutorConversationList
                loading={conversationsLoading}
                conversations={data?.tutorConversations ?? []}
                activeId={conversationId}
                onOpen={(id) => void open(id)}
              />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Card withBorder radius="md" p="md">
              <Stack gap="md">
                <ScrollArea.Autosize mah={520} type="auto">
                  <Stack gap="md" p="xs">
                    {messages.length === 0 ? (
                      <TutorStarters
                        onPick={(message) => void send(message)}
                        disabled={sending}
                      />
                    ) : (
                      messages.map((message) => (
                        <TutorMessageBubble
                          key={message.id}
                          message={message}
                          onReport={(id) => void handleReport(id)}
                        />
                      ))
                    )}
                    <div ref={bottom} />
                  </Stack>
                </ScrollArea.Autosize>

                {error && (
                  <Alert color="orange" variant="light">
                    <Text size="sm">{error}</Text>
                  </Alert>
                )}

                <TutorComposer
                  onSend={(message) => void send(message)}
                  disabled={sending || waiting}
                />
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Page>
  );
}
