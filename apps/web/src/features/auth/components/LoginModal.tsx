'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AuthError, loginWithPassword } from '../api/login';
import type { AuthSession } from '../api/types';
import { saveSession } from '../lib/session';

export interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Gọi sau khi đăng nhập thành công, nhận session đã lưu. */
  onSuccess?: (session: AuthSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSuccess }) => {
  const titleId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Huỷ request đang bay nếu người dùng đóng popup giữa chừng.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) return;

    abortRef.current?.abort();
    abortRef.current = null;

    // Dọn form sau khi hiệu ứng đóng chạy xong để tránh chữ nhảy trước mắt người dùng.
    const timer = window.setTimeout(() => {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setLoading(false);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const session = await loginWithPassword(
        { email: email.trim(), password },
        controller.signal,
      );

      saveSession(session);
      onSuccess?.(session);
      onClose();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(
        err instanceof AuthError ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.',
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} dismissible={!loading}>
      <div className="p-7 sm:p-8">
        {/* Tiêu đề: icon ngọn lửa + tên thương hiệu */}
        <div className="flex items-start gap-3">
          <FlameIcon className="mt-0.5 h-9 w-9 shrink-0" />
          <div>
            <h2 id={titleId} className="text-xl font-extrabold tracking-tight text-[#1E2B4E]">
              Welcome to Englow3
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Your Personal Path, Your Future in Hand
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Input
            label="Username"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="example@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoFocus
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
                className="cursor-pointer rounded text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/40"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="gradient"
            className="w-full rounded-lg py-2.5"
            isLoading={loading}
            disabled={!email || !password}
          >
            {loading ? 'Đang đăng nhập…' : 'Login'}
          </Button>
        </form>

        {/* Phân cách */}
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium whitespace-nowrap text-slate-400">
            Or continue with
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Đăng nhập mạng xã hội — chưa nối API, xem ghi chú trong README */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <SocialButton label="Đăng nhập với Google">
            <GoogleIcon />
          </SocialButton>
          <SocialButton label="Đăng nhập với Facebook">
            <FacebookIcon />
          </SocialButton>
        </div>
      </div>
    </Modal>
  );
};

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C488F]/40 active:scale-95"
    >
      {children}
    </button>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="englow3-flame" x1="16" y1="2" x2="16" y2="30">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path
        fill="url(#englow3-flame)"
        d="M17.6 2.2c.5 4-1 6.3-3 8.4-2.2 2.4-4.9 4.6-4.9 9 0 4.5 3.6 8.2 8.1 8.2 4.6 0 8.2-3.7 8.2-8.2 0-5.5-3.9-8.6-6-12.6-.4 1.6-1.3 2.8-2.5 3.7.6-2.9.6-5.7.1-8.5Z"
      />
      <path
        fill="#FEF3C7"
        d="M17.8 18.2c1.6 1.3 2.2 2.6 2.2 4a4.2 4.2 0 0 1-8.4 0c0-2.2 1.6-3.5 2.8-5 .3 1 .9 1.7 1.7 2.2-.2-1.4-.1-2.6.4-3.8.3.9.7 1.8 1.3 2.6Z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.3 4.1M6.5 7.9A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.35 3.8-.9M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 3c2.3-2.1 3.6-5.2 3.6-8.7Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.1 14.3a7.2 7.2 0 0 1 0-4.6l-3.9-3a12 12 0 0 0 0 10.6l3.9-3Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0A12 12 0 0 0 1.2 6.7l3.9 3C6.1 6.9 8.8 4.8 12 4.8Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  );
}
