import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const navItems = [
  { label: "Study", href: "/study", hasSubmenu: true },
  { label: "Mock Test", href: "/mock-test", hasSubmenu: false },
  { label: "AI Tutor", href: "/ai-tutor", hasSubmenu: false },
] as const;

export function SiteHeader() {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6 lg:h-20 lg:gap-8 lg:px-8">
        <Link href="/" className="shrink-0">
          <Image
            src="/englow3-logo.png"
            alt="Englow3 - Your Personal Path, Your Future in Hand"
            width={401}
            height={125}
            className="h-10 w-[128px] object-contain lg:h-14 lg:w-[180px]"
            priority
          />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 px-5 py-2 text-base font-bold text-slate-600 transition-colors hover:text-amber-600"
            >
              {item.label}
              {item.hasSubmenu ? (
                <ChevronDown
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={3}
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="ml-auto flex h-10 w-[88px] items-center justify-center rounded-xl border border-blue-900 bg-slate-100 text-[15px] font-bold text-blue-900 transition-colors hover:bg-blue-900 hover:text-slate-100 lg:ml-6 lg:h-11 lg:w-[104px] lg:text-base"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
