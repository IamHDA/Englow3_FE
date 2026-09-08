import { redirect } from "next/navigation";

export default function QuizIndexPage() {
  redirect("/study/daily-path?tab=quizzes");
}
