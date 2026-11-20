import { Award, CalendarClock, Layers } from "lucide-react";

import { LibraryCard } from "@/shared/components/LibraryCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { IeltsFullTestCatalogueQuery } from "@/lib/graphql/generated/documents";

type FullTest = IeltsFullTestCatalogueQuery["fullTests"][number];
type Sitting = IeltsFullTestCatalogueQuery["myFullTestSittings"][number];

type FullTestCardProps = {
  test: FullTest;
  /** The learner's sittings of this test, newest first. */
  sittings: Sitting[];
};

/**
 * One IELTS full test in the library: four skills and one band. Its status is
 * the learner's newest sitting of it, and the best band any sitting reached.
 */
export function FullTestCard({ test, sittings }: FullTestCardProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);

  const latest = sittings[0];
  const open = latest?.status === "IN_PROGRESS";
  const awaiting = latest?.status === "AWAITING_GRADES";
  const bands = sittings
    .map((sitting) => sitting.overallBand)
    .filter((band): band is number => band != null);
  const best = bands.length > 0 ? Math.max(...bands) : null;

  const meta = [
    {
      icon: <Layers size={15} />,
      label: "Listening · Reading · Writing · Speaking",
    },
    {
      icon: <CalendarClock size={15} />,
      label: tr("Nộp đủ trong 7 ngày", "Hand in within 7 days"),
    },
  ];
  if (best != null) {
    meta.push({
      icon: <Award size={15} />,
      label: tr(
        `Band cao nhất ${best.toFixed(1)}`,
        `Best band ${best.toFixed(1)}`,
      ),
    });
  }

  return (
    <LibraryCard
      eyebrow={`IELTS ${test.certificateVariant === "GENERAL" ? "General" : "Academic"}`}
      status={
        open
          ? { label: tr("Đang làm", "In progress"), color: "orange" }
          : awaiting
            ? { label: tr("Đang chờ chấm", "Being graded"), color: "yellow" }
            : best != null
              ? { label: tr("Đã có band", "Band ready"), color: "teal" }
              : undefined
      }
      title={test.title}
      meta={meta}
      action={{
        label: open ? tr("Tiếp tục", "Continue") : tr("Xem đề", "View test"),
        // An open sitting goes straight back to its parts.
        href: open
          ? `/exams/full-tests/sittings/${latest.id}`
          : `/exams/full-tests/${test.id}`,
        emphasis: open ? "continue" : "default",
      }}
    />
  );
}
