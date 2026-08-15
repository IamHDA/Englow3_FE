export type HomeStat = {
  /** Headline figure, already formatted for display. */
  value: string;
  label: string;
  /** Renders the figure in the brand accent colour instead of the default. */
  accent: boolean;
};

/**
 * Marketing figures shown on the landing page. They are editorial copy rather
 * than live metrics, so they are held here instead of behind a BFF query.
 */
export const homeStats: HomeStat[] = [
  { value: "150K+", label: "Học viên hoạt động", accent: true },
  { value: "98.4%", label: "Cải thiện điểm số", accent: false },
  { value: "4.9 / 5", label: "Đánh giá người dùng", accent: true },
];
