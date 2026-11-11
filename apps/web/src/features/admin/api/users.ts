import { CSRF_HEADER, CSRF_VALUE } from "@/lib/security/csrf";
export type UserRole = "LEARNER" | "STAFF" | "ADMIN";
export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};
export type UserPage = {
  items: AdminUser[];
  page: number;
  totalPages: number;
  totalItems: number;
};
export type RoleChange = {
  id: string;
  actorId: string | null;
  previousRole: UserRole;
  newRole: UserRole;
  reason: string;
  createdAt: string;
};
const base = "/api/bff/rest/admin/users";
export class UserAdminError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
async function read<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok || body === null)
    throw new UserAdminError(
      typeof body?.code === "string" ? body.code : "UNKNOWN",
    );
  return body as T;
}
export async function searchUsers(
  term: string,
  role: string,
  page: number,
  signal: AbortSignal,
) {
  const query = new URLSearchParams({ term, page: String(page), size: "20" });
  if (role) query.set("role", role);
  return read<UserPage>(
    await fetch(`${base}?${query}`, {
      headers: { [CSRF_HEADER]: CSRF_VALUE },
      signal,
      cache: "no-store",
      credentials: "same-origin",
    }),
  );
}
export async function changeUserRole(
  user: AdminUser,
  role: UserRole,
  reason: string,
) {
  return read<AdminUser>(
    await fetch(`${base}/${encodeURIComponent(user.id)}/role`, {
      method: "PUT",
      credentials: "same-origin",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "content-type": "application/json",
        [CSRF_HEADER]: CSRF_VALUE,
      },
      body: JSON.stringify({ expectedRole: user.role, role, reason }),
    }),
  );
}
export async function roleHistory(id: string, signal: AbortSignal) {
  return read<RoleChange[]>(
    await fetch(`${base}/${encodeURIComponent(id)}/role-history`, {
      headers: { [CSRF_HEADER]: CSRF_VALUE },
      signal,
      cache: "no-store",
      credentials: "same-origin",
    }),
  );
}
