import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { RelationshipButton } from "@/features/friends/RelationshipButton";
import { Avatar } from "@/features/shared/Avatar";
import { formatDate } from "@/features/shared/labels";
import {
  RelationshipStatus,
  useBlockedUsersQuery,
  useFriendsQuery,
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
  useSearchLearnersQuery,
} from "@/lib/graphql/generated";
import {
  AppText,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Pager,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { QueryView } from "@/ui/QueryView";
import { spacing } from "@/ui/theme";

type Tab = "friends" | "incoming" | "outgoing" | "search" | "blocked";

function Person({
  userId,
  name,
  avatar,
  subtitle,
  action,
}: {
  userId: string;
  name: string;
  avatar?: string | null;
  subtitle?: string;
  action: React.ReactNode;
}) {
  return (
    <Card
      style={{ marginBottom: spacing.sm }}
      onPress={() =>
        router.push({ pathname: "/people/[userId]", params: { userId } })
      }
    >
      <Row>
        <Avatar url={avatar} name={name} />
        <View style={{ flex: 1 }}>
          <AppText variant="label">{name}</AppText>
          {subtitle ? (
            <AppText variant="caption" tone="muted">
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </Row>
      <View style={{ marginTop: spacing.sm, alignItems: "flex-start" }}>
        {action}
      </View>
    </Card>
  );
}

export default function FriendsScreen() {
  const [tab, setTab] = useState<Tab>("friends");
  return (
    <Screen>
      <Stack.Screen options={{ title: "Bạn bè" }} />
      <ChipRow>
        <Chip
          label="Bạn bè"
          selected={tab === "friends"}
          onPress={() => setTab("friends")}
        />
        <Chip
          label="Lời mời"
          selected={tab === "incoming"}
          onPress={() => setTab("incoming")}
        />
        <Chip
          label="Đã gửi"
          selected={tab === "outgoing"}
          onPress={() => setTab("outgoing")}
        />
        <Chip
          label="Tìm bạn"
          selected={tab === "search"}
          onPress={() => setTab("search")}
        />
        <Chip
          label="Đã chặn"
          selected={tab === "blocked"}
          onPress={() => setTab("blocked")}
        />
      </ChipRow>
      {tab === "friends" ? <FriendList /> : null}
      {tab === "incoming" ? <Requests incoming /> : null}
      {tab === "outgoing" ? <Requests incoming={false} /> : null}
      {tab === "search" ? <Search /> : null}
      {tab === "blocked" ? <Blocked /> : null}
    </Screen>
  );
}

function FriendList() {
  const [page, setPage] = useState(0);
  const query = useFriendsQuery({
    variables: { page, size: 20 },
    fetchPolicy: "cache-and-network",
  });
  return (
    <QueryView
      loading={query.loading}
      error={query.error}
      data={query.data?.friends}
      onRetry={() => void query.refetch()}
      isEmpty={(data) => data.items.length === 0}
      empty={
        <EmptyState
          icon="people-outline"
          title="Bạn chưa có bạn bè"
          message="Tìm người học khác trong tab Tìm bạn."
        />
      }
    >
      {(data) => (
        <>
          {data.items.map((friend) => (
            <Person
              key={friend.userId}
              userId={friend.userId}
              name={friend.displayName}
              avatar={friend.avatarUrl}
              subtitle={`Bạn bè từ ${formatDate(friend.friendsSince)}`}
              action={
                <RelationshipButton
                  userId={friend.userId}
                  status={RelationshipStatus.FRIENDS}
                  onChanged={() => void query.refetch()}
                  compact
                />
              }
            />
          ))}
          <Pager
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </QueryView>
  );
}

function Requests({ incoming }: { incoming: boolean }) {
  const [page, setPage] = useState(0);
  const incomingQuery = useIncomingFriendRequestsQuery({
    variables: { page, size: 20 },
    skip: !incoming,
    fetchPolicy: "cache-and-network",
  });
  const outgoingQuery = useOutgoingFriendRequestsQuery({
    variables: { page, size: 20 },
    skip: incoming,
    fetchPolicy: "cache-and-network",
  });
  const query = incoming ? incomingQuery : outgoingQuery;
  const data = incoming
    ? incomingQuery.data?.incomingFriendRequests
    : outgoingQuery.data?.outgoingFriendRequests;
  return (
    <QueryView
      loading={query.loading}
      error={query.error}
      data={data}
      onRetry={() => void query.refetch()}
      isEmpty={(value) => value.items.length === 0}
      empty={
        <EmptyState
          icon="mail-outline"
          title={incoming ? "Không có lời mời nào" : "Bạn chưa gửi lời mời nào"}
        />
      }
    >
      {(value) => (
        <>
          {value.items.map((request) => (
            <Person
              key={request.requestId}
              userId={request.userId}
              name={request.displayName}
              avatar={request.avatarUrl}
              subtitle={formatDate(request.requestedAt)}
              action={
                <RelationshipButton
                  userId={request.userId}
                  status={
                    incoming
                      ? RelationshipStatus.REQUEST_RECEIVED
                      : RelationshipStatus.REQUEST_SENT
                  }
                  requestId={request.requestId}
                  onChanged={() => void query.refetch()}
                  compact
                />
              }
            />
          ))}
          <Pager
            page={value.page}
            totalPages={value.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </QueryView>
  );
}

function Search() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(input.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);
  const query = useSearchLearnersQuery({
    variables: { q, page, size: 20 },
    skip: q.length < 2,
  });
  return (
    <>
      <TextField
        placeholder="Nhập tên người học (ít nhất 2 ký tự)…"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        accessibilityLabel="Tìm người học"
      />
      {q.length < 2 ? null : (
        <QueryView
          loading={query.loading}
          error={query.error}
          data={query.data?.searchLearners}
          onRetry={() => void query.refetch()}
          isEmpty={(data) => data.items.length === 0}
          empty={<EmptyState icon="search-outline" title="Không tìm thấy ai" />}
        >
          {(data) => (
            <>
              {data.items.map((learner) => (
                <Person
                  key={learner.userId}
                  userId={learner.userId}
                  name={learner.displayName}
                  avatar={learner.avatarUrl}
                  action={
                    <RelationshipButton
                      userId={learner.userId}
                      status={learner.relationship}
                      requestId={learner.requestId}
                      onChanged={() => void query.refetch()}
                      compact
                    />
                  }
                />
              ))}
              <Pager
                page={data.page}
                totalPages={data.totalPages}
                onChange={setPage}
              />
            </>
          )}
        </QueryView>
      )}
    </>
  );
}

function Blocked() {
  const [page, setPage] = useState(0);
  const query = useBlockedUsersQuery({
    variables: { page, size: 20 },
    fetchPolicy: "cache-and-network",
  });
  return (
    <QueryView
      loading={query.loading}
      error={query.error}
      data={query.data?.blockedUsers}
      onRetry={() => void query.refetch()}
      isEmpty={(data) => data.items.length === 0}
      empty={<EmptyState icon="ban-outline" title="Bạn chưa chặn ai" />}
    >
      {(data) => (
        <>
          {data.items.map((user) => (
            <Person
              key={user.userId}
              userId={user.userId}
              name={user.displayName}
              avatar={user.avatarUrl}
              subtitle={`Chặn từ ${formatDate(user.blockedAt)}`}
              action={
                <RelationshipButton
                  userId={user.userId}
                  status={RelationshipStatus.BLOCKED_BY_ME}
                  onChanged={() => void query.refetch()}
                  compact
                />
              }
            />
          ))}
          <Pager
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </QueryView>
  );
}
