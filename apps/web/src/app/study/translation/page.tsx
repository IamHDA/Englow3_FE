import type { Metadata } from "next";

import { TranslationLibraryView } from "@/features/translation/components/views/TranslationLibraryView";

export const metadata: Metadata = {
  title: "Luyện dịch Việt → Anh | Englow3",
  description:
    "Dịch từng câu tiếng Việt sang tiếng Anh, được AI chấm ý nghĩa, ngữ pháp, từ vựng và độ tự nhiên.",
};

export default function TranslationPage() {
  return <TranslationLibraryView />;
}
