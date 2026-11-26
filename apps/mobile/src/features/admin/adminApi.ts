import { rest } from "@/lib/rest";

/** The BFF's REST back-office routes, as the web's apps/web/src/features/admin/api uses them. */
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

export function searchUsers(term: string, role: string, page: number) {
  const query = new URLSearchParams({ term, page: String(page), size: "20" });
  if (role) query.set("role", role);
  return rest<UserPage>(`/admin/users?${query}`);
}

/** `expectedRole` guards against two administrators changing the same person at once. */
export function changeUserRole(
  user: AdminUser,
  role: UserRole,
  reason: string,
) {
  return rest<AdminUser>(`/admin/users/${encodeURIComponent(user.id)}/role`, {
    method: "PUT",
    body: { expectedRole: user.role, role, reason },
  });
}

export function roleHistory(id: string) {
  return rest<RoleChange[]>(
    `/admin/users/${encodeURIComponent(id)}/role-history`,
  );
}

export function grantPro(
  email: string,
  billingPeriod: "MONTHLY" | "YEARLY",
  days: number,
) {
  return rest<unknown>("/admin/subscriptions", {
    method: "PUT",
    body: { email, billingPeriod, days },
  });
}

export function revokePro(email: string) {
  return rest<unknown>("/admin/subscriptions/revoke", {
    method: "POST",
    body: { email },
  });
}

export type ScoreConversion = {
  id: number;
  sectionType: "LISTENING" | "READING";
  rawScoreFrom: number;
  rawScoreTo: number;
  convertedScore: number;
  effectiveFrom: string;
  sourceReference: string | null;
};

const SCORE_CONVERSIONS = "/admin/exam-score-conversions/toeic";

export function scoreConversions() {
  return rest<ScoreConversion[]>(SCORE_CONVERSIONS);
}

/** Publishes a new version from `effectiveFrom`; results already recorded keep their score. */
export function publishScoreConversions(
  effectiveFrom: string,
  sourceReference: string,
  rows: unknown[],
) {
  return rest<ScoreConversion[]>(SCORE_CONVERSIONS, {
    method: "POST",
    body: { effectiveFrom, sourceReference, rows },
  });
}
