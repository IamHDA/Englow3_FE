import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button'; // Sử dụng component Button đã tạo trước đó

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* 1. Phần Hero Section chính */}
      <main className="container-page pt-12 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Cột Trái: Tiêu đề, Slogan, Mô tả và Nút CTA */}
        <div className="lg:col-span-7 flex flex-col items-start">
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1E3A8A] tracking-tight leading-tight">
            Master English with <br />
            Englow3 AI Intelligence
          </h1>

          <p className="mt-4 text-xl italic font-medium text-slate-600">
            &ldquo;Your Personal Path, Your Future in Hand&rdquo;
          </p>

          <p className="mt-6 text-base text-slate-500 leading-relaxed max-w-xl">
            Transform your fluency with real-time AI speech pronunciation scoring, adaptive daily learning paths, 3D flashcards, dictation challenges, and full IELTS/TOEIC mock exam simulations.
          </p>

          <div className="mt-8">
            <Link href="/study">
              <Button variant="accent" size="lg" className="rounded-xl px-8 py-4 text-base font-semibold shadow-lg shadow-amber-500/20 flex items-center gap-2 group">
                Start Learning now
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </Link>
          </div>

        </div>

        {/* Cột Phải: Ảnh minh hoạ hệ sinh thái Englow3.
            Dưới ngưỡng lg (1024px) lưới rút còn 1 cột, ảnh sẽ tụt xuống dưới phần chữ
            nên ẩn hẳn thay vì để nó rơi xuống. */}
        <div className="hidden lg:col-span-5 lg:flex justify-center">
          <Image
            src="/images/home.svg"
            alt="Nền tảng Englow3 AI: chấm điểm phát âm, flashcard và theo dõi tiến độ"
            width={700}
            height={600}
            priority
            className="w-full h-auto max-w-xl object-contain"
          />
        </div>

      </main>

      {/* 2. Phần Thống Kê (Stats Footer) — TẠM ẨN, bỏ comment bên dưới để bật lại */}
      {/*
      <section className="border-t border-slate-200/60 bg-white/40 py-10">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-[#1E3A8A]">150K+</span>
            <span className="text-sm font-medium text-slate-500 mt-1">Active Learners</span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-[#1E3A8A]">98.4%</span>
            <span className="text-sm font-medium text-slate-500 mt-1">Band Score Gain</span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-[#1E3A8A]">4.9 / 5</span>
            <span className="text-sm font-medium text-slate-500 mt-1">User Rating</span>
          </div>

        </div>
      </section>
      */}

    </div>
  );
}