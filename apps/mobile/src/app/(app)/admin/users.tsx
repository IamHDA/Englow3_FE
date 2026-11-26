import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import {
  changeUserRole,
  roleHistory,
  searchUsers,
  type AdminUser,
  type RoleChange,
  type UserPage,
  type UserRole,
} from "@/features/admin/adminApi";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatDateTime } from "@/features/shared/labels";
import { RestError } from "@/lib/rest";
import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  Pager,
  Row,
  Screen,
  TextField,
} from "@/ui/components";
import { usePrompt } from "@/ui/usePrompt";
import { spacing } from "@/ui/theme";

const ROLE_LABELS: Record<UserRole, string> = {
  LEARNER: "Học viên",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

const ROLE_ERRORS: Record<string, string> = {
  USER_ROLE_CHANGED:
    "Vai trò của người này vừa được người khác đổi. Hãy tải lại.",
  SELF_ROLE_CHANGE_NOT_ALLOWED: "Bạn không thể tự đổi vai trò của mình.",
  ROLE_CHANGE_INVALID: "Không thể đổi sang vai trò này.",
  USER_NOT_FOUND: "Không tìm thấy người dùng này.",
};

export default function AdminUsersScreen() {
  const { me } = useAuth();
  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<UserPage | null>(null);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<{
    userId: string;
    items: RoleChange[];
  } | null>(null);
  const prompt = usePrompt();

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    searchUsers(term, role, page)
      .then((result) => {
        if (!active) return;
        setData(result);
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [term, role, page, reload]);

  const load = () => {
    setFailed(false);
    setReload((value) => value + 1);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(input.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [input]);

  if (me?.role !== "ADMIN") return <Redirect href="/admin" />;

  function changeRole(user: AdminUser) {
    const options = (Object.keys(ROLE_LABELS) as UserRole[]).filter(
      (value) => value !== user.role,
    );
    Alert.alert(
      `Đổi vai trò của ${user.displayName}`,
      `Hiện tại: ${ROLE_LABELS[user.role]}`,
      [
        ...options.map((value) => ({
          text: ROLE_LABELS[value],
          onPress: () =>
            void prompt
              .ask({
                title: `Đổi thành ${ROLE_LABELS[value]}`,
                message: "Lý do được lưu vào lịch sử vai trò.",
                placeholder: "Lý do",
                confirmLabel: "Đổi",
              })
              .then((reason) => {
                if (!reason) return;
                changeUserRole(user, value, reason)
                  .then(() => {
                    setNotice(
                      `Đã đổi ${user.displayName} thành ${ROLE_LABELS[value]}.`,
                    );
                    load();
                  })
                  .catch((failure) =>
                    setNotice(
                      failure instanceof RestError
                        ? (ROLE_ERRORS[failure.code] ??
                            "Chưa đổi được vai trò.")
                        : "Chưa đổi được vai trò.",
                    ),
                  );
              }),
        })),
        { text: "Huỷ", style: "cancel" },
      ],
    );
  }

  return (
    <Screen>
      {prompt.element}
      <Stack.Screen options={{ title: "Người dùng" }} />
      <Notice
        message={notice}
        tone={notice?.startsWith("Đã") ? "success" : "danger"}
      />
      <TextField
        placeholder="Tìm theo email hoặc tên…"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        accessibilityLabel="Tìm người dùng"
      />
      <ChipRow>
        <Chip
          label="Tất cả"
          selected={role === ""}
          onPress={() => {
            setRole("");
            setPage(0);
          }}
        />
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((value) => (
          <Chip
            key={value}
            label={ROLE_LABELS[value]}
            selected={role === value}
            onPress={() => {
              setRole(value);
              setPage(0);
            }}
          />
        ))}
      </ChipRow>
      {failed ? (
        <ErrorState
          message="Chưa tải được danh sách người dùng."
          onRetry={load}
        />
      ) : !data ? (
        <LoadingState />
      ) : data.items.length === 0 ? (
        <EmptyState icon="people-outline" title="Không tìm thấy ai" />
      ) : (
        <>
          {data.items.map((user) => (
            <Card key={user.id} style={{ marginBottom: spacing.sm }}>
              <Row style={{ justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="label">{user.displayName}</AppText>
                  <AppText variant="caption" tone="muted">
                    {user.email}
                  </AppText>
                </View>
                <Badge
                  label={ROLE_LABELS[user.role]}
                  tone={user.role === "LEARNER" ? "neutral" : "primary"}
                />
              </Row>
              <Row gap={spacing.xs} style={{ marginTop: spacing.sm }}>
                {user.id !== me.id ? (
                  <Button
                    title="Đổi vai trò"
                    size="sm"
                    variant="secondary"
                    onPress={() => changeRole(user)}
                  />
                ) : null}
                <Button
                  title="Lịch sử"
                  size="sm"
                  variant="ghost"
                  onPress={() =>
                    void roleHistory(user.id)
                      .then((items) => setHistory({ userId: user.id, items }))
                      .catch(() => setNotice("Chưa tải được lịch sử vai trò."))
                  }
                />
              </Row>
              {history?.userId === user.id ? (
                history.items.length === 0 ? (
                  <AppText variant="caption" tone="muted">
                    Chưa từng đổi vai trò.
                  </AppText>
                ) : (
                  history.items.map((change) => (
                    <AppText key={change.id} variant="caption" tone="muted">
                      {formatDateTime(change.createdAt)}:{" "}
                      {ROLE_LABELS[change.previousRole]} →{" "}
                      {ROLE_LABELS[change.newRole]} ({change.reason})
                    </AppText>
                  ))
                )
              ) : null}
            </Card>
          ))}
          <Pager
            page={data.page}
            totalPages={data.totalPages}
            onChange={setPage}
          />
        </>
      )}
    </Screen>
  );
}
