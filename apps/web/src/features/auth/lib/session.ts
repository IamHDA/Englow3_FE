import type { AuthSession } from '../api/types';

const STORAGE_KEY = 'englow3.auth.session';

/**
 * Lưu session vào localStorage.
 *
 * Lưu ý: localStorage đọc được bằng JavaScript nên không chống được XSS.
 * Khi BFF sẵn sàng, nên chuyển sang cookie HttpOnly do server đặt.
 */
export function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Chế độ riêng tư hoặc hết dung lượng — bỏ qua, phiên chỉ tồn tại trong bộ nhớ.
  }
}

export function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;

    // expires_at tính bằng giây, Date.now() tính bằng mili giây.
    if (session.expires_at * 1000 <= Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Không làm gì.
  }
}
