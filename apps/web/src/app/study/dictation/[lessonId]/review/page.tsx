import type { Metadata } from "next";

import { DictationReviewView } from "@/features/dictation";

export const metadata: Metadata = {
  title: "Ôn tập câu sai | Englow3",
  description:
    "Luyện lại riêng những câu đã chép sai để nắm vững từ vựng và ngữ pháp.",
};

/**
 * Route vẫn nằm dưới `[lessonId]` vì màn luyện tập dẫn sang đây, nhưng danh
 * sách là của cả người học chứ không riêng bài đó - nên id không được dùng tới.
 * Đổi route thành `/study/dictation/review` sẽ đúng hơn, và đó là một thay đổi
 * đường dẫn nên tách riêng.
 */
export default function DictationReviewPage() {
  return <DictationReviewView />;
}
