"use client";
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/shared/components/Page";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  searchUsers,
  changeUserRole,
  roleHistory,
  UserAdminError,
  type UserPage,
  type AdminUser,
  type UserRole,
  type RoleChange,
} from "../../api/users";

function RoleHistory({ id, isVi }: { id: string; isVi: boolean }) {
  const [state, setState] = useState<{
    entries?: RoleChange[];
    failed?: boolean;
  }>({});
  useEffect(() => {
    const abort = new AbortController();
    void roleHistory(id, abort.signal)
      .then((entries) => {
        if (!abort.signal.aborted) setState({ entries });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ failed: true });
      });
    return () => abort.abort();
  }, [id]);
  if (state.failed)
    return (
      <Text c="red" role="alert">
        {isVi ? "Không tải được lịch sử." : "Could not load history."}
      </Text>
    );
  if (!state.entries) return <Skeleton height={40} />;
  return (
    <Stack gap="xs">
      {state.entries.length === 0 ? (
        <Text size="sm">
          {isVi ? "Chưa có thay đổi được ghi nhận." : "No recorded changes."}
        </Text>
      ) : (
        state.entries.map((e) => (
          <div key={e.id}>
            <Text size="sm">
              {e.previousRole} → {e.newRole} ·{" "}
              {new Date(e.createdAt).toLocaleString(isVi ? "vi-VN" : "en-GB")}
            </Text>
            <Text size="sm" c="dimmed">
              {e.reason}
            </Text>
          </div>
        ))
      )}
    </Stack>
  );
}
export function AdminUsersView() {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [term, setTerm] = useState("");
  const [debounced] = useDebouncedValue(term, 300);
  const [role, setRole] = useState<string>("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const key = JSON.stringify([debounced, role, page, revision]);
  const [loaded, setLoaded] = useState<{
    key: string;
    data?: UserPage;
    error?: boolean;
  }>({ key: "" });
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [nextRole, setNextRole] = useState<UserRole>("LEARNER");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    void searchUsers(
      debounced,
      role,
      page,
      AbortSignal.any([abort.signal, AbortSignal.timeout(15_000)]),
    )
      .then((data) => {
        if (!abort.signal.aborted) setLoaded({ key, data });
      })
      .catch(() => {
        if (!abort.signal.aborted) setLoaded({ key, error: true });
      });
    return () => abort.abort();
  }, [debounced, role, page, revision, key]);
  const loading = loaded.key !== key;
  async function save() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      await changeUserRole(selected, nextRole, reason.trim());
      setSelected(null);
      setRevision((v) => v + 1);
    } catch (failure) {
      const code = failure instanceof UserAdminError ? failure.code : "UNKNOWN";
      setError(
        code === "SELF_ROLE_CHANGE_NOT_ALLOWED"
          ? tr(
              "Nhờ một Admin khác đổi quyền của bạn.",
              "Ask another administrator to change your role.",
            )
          : code === "USER_ROLE_CHANGED"
            ? tr(
                "Quyền đã được thay đổi. Đóng hộp thoại và tải lại danh sách.",
                "This role changed. Close the dialog and reload the list.",
              )
            : tr(
                "Không lưu được. Kiểm tra kết nối hoặc đăng nhập lại nếu quyền đã thay đổi.",
                "Could not save. Check your connection or sign in again if your access changed.",
              ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <PageHeader title={tr("Người dùng & phân quyền", "Users & roles")} />
      <Stack gap="lg">
        <Group align="end">
          <TextInput
            label={tr("Tìm theo tên hoặc email", "Search name or email")}
            value={term}
            maxLength={200}
            onChange={(e) => {
              setTerm(e.currentTarget.value);
              setPage(0);
            }}
          />
          <Select
            label={tr("Vai trò", "Role")}
            data={[
              { value: "", label: tr("Tất cả", "All") },
              "LEARNER",
              "STAFF",
              "ADMIN",
            ]}
            value={role}
            onChange={(v) => {
              setRole(v ?? "");
              setPage(0);
            }}
          />
          <Button variant="default" onClick={() => setRevision((v) => v + 1)}>
            {tr("Tải lại", "Refresh")}
          </Button>
        </Group>
        {loading ? (
          <Skeleton height={240} />
        ) : loaded.error ? (
          <Alert color="orange" role="alert">
            {tr(
              "Không tải được danh sách. Bấm Tải lại để thử lại.",
              "Could not load users. Choose Refresh to retry.",
            )}
          </Alert>
        ) : (
          <>
            <Table.ScrollContainer minWidth={560}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{tr("Người dùng", "User")}</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>{tr("Vai trò", "Role")}</Table.Th>
                    <Table.Th>{tr("Thao tác", "Action")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loaded.data?.items.map((user) => (
                    <Table.Tr key={user.id}>
                      <Table.Td>{user.displayName}</Table.Td>
                      <Table.Td>{user.email}</Table.Td>
                      <Table.Td>
                        <Badge>{user.role}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => {
                            setSelected(user);
                            setNextRole(user.role);
                            setReason("");
                            setError(null);
                          }}
                        >
                          {tr("Quyền / lịch sử", "Role / history")}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            {loaded.data?.items.length === 0 && (
              <Text>{tr("Không tìm thấy người dùng.", "No users found.")}</Text>
            )}
            {(loaded.data?.totalPages ?? 0) > 1 && (
              <Pagination
                value={page + 1}
                total={loaded.data?.totalPages ?? 1}
                onChange={(v) => setPage(v - 1)}
              />
            )}
          </>
        )}
        <Modal
          opened={selected !== null}
          onClose={() => {
            if (!busy) setSelected(null);
          }}
          title={selected?.email}
          closeOnClickOutside={!busy}
          closeOnEscape={!busy}
          withCloseButton={!busy}
        >
          {selected && (
            <Stack>
              <Alert>
                {tr(
                  "Thay đổi được ghi lịch sử. Quyền quản trị cũ bị chặn ngay tại backend; người dùng cần đăng nhập lại để nhận quyền mới.",
                  "Changes are audited. Old privileged access is blocked by the backend immediately; the user must sign in again to receive the new role.",
                )}
              </Alert>
              <Select
                label={tr("Vai trò mới", "New role")}
                data={["LEARNER", "STAFF", "ADMIN"]}
                value={nextRole}
                onChange={(v) => setNextRole(v as UserRole)}
                allowDeselect={false}
                disabled={busy}
              />
              <Textarea
                label={tr("Lý do", "Reason")}
                maxLength={2000}
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                disabled={busy}
              />
              {error && (
                <Alert color="orange" role="alert">
                  {error}
                </Alert>
              )}
              <Button
                loading={busy}
                disabled={!reason.trim() || nextRole === selected.role}
                onClick={() => void save()}
              >
                {tr("Lưu thay đổi quyền", "Save role change")}
              </Button>
              <Text fw={600}>{tr("Lịch sử gần nhất", "Recent history")}</Text>
              <RoleHistory key={selected.id} id={selected.id} isVi={isVi} />
            </Stack>
          )}
        </Modal>
      </Stack>
    </Page>
  );
}
