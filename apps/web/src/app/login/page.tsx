"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<any>(null);
  const [showRawJson, setShowRawJson] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAuthResult(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error_description || data.error || "Login failed. Please check your credentials."
        );
      } else {
        setSuccess("Login successful!");
        setAuthResult(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthResult(null);
    setSuccess(null);
    setError(null);
    setPassword("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-[520px] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-8 sm:p-10 transition-all duration-300">
        
        {/* Header Section: Logo from favicon.ico + Title */}
        <div className="flex items-center gap-4 mb-8">
          {/* Logo Container using favicon.ico */}
          <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 p-2 border border-slate-200 dark:border-zinc-700 shadow-md flex items-center justify-center overflow-hidden">
            <Image
              src="/favicon.ico"
              alt="Englow3 Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
              Welcome to Englow3
            </h1>
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-400 mt-0.5">
              Your Personal Path, Your Future in Hand
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
            <svg
              className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Successful Authentication State Display */}
        {authResult ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Authenticated User
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  {authResult.user?.role || "Active"}
                </span>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-900 dark:text-zinc-100 font-semibold">
                  Email: <span className="font-normal text-slate-700 dark:text-zinc-300">{authResult.user?.email}</span>
                </p>
                <p className="text-slate-900 dark:text-zinc-100 font-semibold truncate">
                  User ID: <span className="font-mono text-xs font-normal text-slate-600 dark:text-zinc-400">{authResult.user?.id}</span>
                </p>
                <p className="text-slate-900 dark:text-zinc-100 font-semibold">
                  Expires in: <span className="font-normal text-slate-700 dark:text-zinc-300">{authResult.expires_in}s</span>
                </p>
              </div>
            </div>

            {/* Response JSON Details Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 py-1"
              >
                <span>Full Supabase Response JSON</span>
                <span>{showRawJson ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {showRawJson && (
                <div className="mt-2 max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-900 text-amber-400 font-mono text-xs leading-relaxed border border-slate-800 scrollbar-thin">
                  <pre>{JSON.stringify(authResult, null, 2)}</pre>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 px-6 rounded-xl text-slate-700 dark:text-zinc-200 font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Sign Out / Back to Login
            </button>
          </div>
        ) : (
          /* Form Container */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-zinc-200 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@gmail.com"
                  required
                  className="w-full px-4 py-3.5 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 bg-white dark:bg-zinc-800/80 border-2 border-amber-500 dark:border-amber-500 rounded-xl outline-none transition-all duration-200 text-base font-medium shadow-sm focus:ring-4 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-base font-bold text-slate-800 dark:text-zinc-200 mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="test123"
                  required
                  className="w-full pl-4 pr-12 py-3.5 text-slate-900 dark:text-zinc-100 bg-[#f4f7fa] dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-800 transition-all duration-200 text-base font-medium"
                />
                {/* Show / Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors p-1 rounded-md focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye Open SVG
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    // Eye Off SVG
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908A9.972 9.972 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M9.88 9.88a3 3 0 104.24 4.24"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#ea8b00] to-[#e27600] hover:from-[#d98000] hover:to-[#d06b00] active:scale-[0.99] shadow-md shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {!authResult && (
          <>
            <div className="relative my-8 flex items-center justify-center">
              <div className="w-full border-t border-dashed border-slate-300 dark:border-zinc-700"></div>
              <span className="absolute bg-white dark:bg-zinc-900 px-3 text-xs font-medium text-slate-500 dark:text-zinc-400">
                ----------Or continue with----------
              </span>
            </div>

            {/* Social Buttons Container */}
            <div className="flex items-center justify-center gap-4">
              {/* Google Icon Button */}
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500 flex items-center justify-center text-slate-700 dark:text-zinc-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                aria-label="Continue with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </button>

              {/* Facebook Icon Button */}
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500 flex items-center justify-center text-slate-700 dark:text-zinc-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                aria-label="Continue with Facebook"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
