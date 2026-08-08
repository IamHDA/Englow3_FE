'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LoginModal } from '@/features/auth/components/LoginModal';

export function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container-page flex h-24 items-center justify-between">
        
        {/* 1. Logo (Bên trái) — file SVG đã gồm sẵn cả chữ ENGLOW3 lẫn slogan */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/images/logo.svg"
            alt="ENGLOW3 — Your Personal Path, Your Future in Hand"
            width={416}
            height={157}
            priority
            className="h-20 w-auto object-contain"
          />
        </Link>

        {/* 2. Menu + Login (gom chung về bên phải) */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            {/* Menu Study có dropdown ∨ */}
            <div className="relative group">
              <button className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors py-2">
                Study
                <svg className="w-4 h-4 text-slate-500 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <Link href="/mock-test" className="text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors">
              Mock Test
            </Link>

            <Link href="/ai-tutor" className="text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] transition-colors">
              AI Tutor
            </Link>
          </nav>

          {/* 3. Nút Login */}
          <Button
            variant="outline"
            onClick={() => setLoginOpen(true)}
            className="rounded-full px-6 border-slate-300 text-[#1E3A8A] font-semibold hover:bg-slate-50"
          >
            Login
          </Button>
        </div>

      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}