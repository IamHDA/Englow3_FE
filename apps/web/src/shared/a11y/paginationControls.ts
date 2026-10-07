type PaginationControl = "first" | "previous" | "last" | "next";

const LABELS: Record<PaginationControl, { vi: string; en: string }> = {
  first: { vi: "Trang đầu", en: "First page" },
  previous: { vi: "Trang trước", en: "Previous page" },
  next: { vi: "Trang sau", en: "Next page" },
  last: { vi: "Trang cuối", en: "Last page" },
};

/**
 * Mantine's pagination arrows are icon-only buttons, so a screen reader hears
 * just "button". Pass the result as `getControlProps` to give each one a name.
 */
export function paginationControlProps(isVi: boolean) {
  return (control: PaginationControl) => ({
    "aria-label": isVi ? LABELS[control].vi : LABELS[control].en,
  });
}
