/**
 * Whether a menu entry of the admin area is the one the page at `pathname`
 * belongs to.
 *
 * The content editor serves every kind of content under /admin/content/editor,
 * exams included, but an exam is listed and managed under "Exams": an exam
 * being edited belongs there, not under "Learning content". Prefixes match on
 * whole segments, so "/admin/exams" never claims "/admin/exam-score-conversions".
 */
export function isAdminNavActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  const section = pathname.startsWith("/admin/content/editor/EXAM/")
    ? "/admin/exams"
    : pathname;
  if (exact) return section === href;
  return section === href || section.startsWith(`${href}/`);
}
