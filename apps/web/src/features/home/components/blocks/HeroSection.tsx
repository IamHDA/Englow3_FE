import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:gap-12">
      <div className="w-full pt-8 lg:w-[600px] lg:shrink-0 lg:pt-16">
        <h1 className="text-3xl font-bold leading-tight text-slate-700 lg:text-[44px]">
          Master English with
          <br />
          Englow3 AI Intelligence
        </h1>

        <p className="mt-5 font-serif text-[22px] text-slate-600 lg:mt-7 lg:text-[28px]">
          &ldquo;<em>Your Personal Path, Your Future in Hand</em>&rdquo;
        </p>

        <p className="mt-5 max-w-[560px] text-[15px] font-medium leading-relaxed text-slate-700 lg:mt-8 lg:text-base">
          Transform your fluency with real-time AI speech pronunciation
          scoring, adaptive daily learning paths, 3D flashcards, dictation
          challenges, and full IELTS/TOEIC mock exam simulations.
        </p>

        <Link
          href="/study"
          className="mt-8 flex h-[52px] w-full max-w-[240px] items-center justify-center gap-2.5 rounded-[14px] bg-gradient-to-r from-amber-500 to-amber-600 px-8 text-base font-bold text-white transition-opacity hover:opacity-90 lg:mt-10"
        >
          Start Learning now
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>

      <div className="lg:mt-24">
        <Image
          src="/home-hero.png"
          alt="Englow3 learning experience: AI processing hub, flashcard deck, progress tracker and pronunciation globe"
          width={395}
          height={363}
          className="h-auto w-full max-w-[400px] object-contain lg:w-[400px]"
          priority
        />
      </div>
    </section>
  );
}
