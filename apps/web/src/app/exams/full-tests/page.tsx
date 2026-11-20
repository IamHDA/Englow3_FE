import { redirect } from "next/navigation";

/**
 * The IELTS full tests are the library's IELTS tabs now (D-IELTS-11); this
 * address is kept for the links and bookmarks that still point here.
 */
export default function FullTestsPage() {
  redirect("/exams?tab=ielts_academic");
}
