import { createTheme, type MantineColorsTuple } from "@mantine/core";

/** Warm accent used for the primary call to action and highlighted figures. */
const amber: MantineColorsTuple = [
  "#fffbeb",
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
];

/** Deep blue used for secondary actions such as the login button. */
const navy: MantineColorsTuple = [
  "#eff6ff",
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
];

/** Neutral scale carrying body copy, borders and surfaces. */
const slate: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

export const theme = createTheme({
  colors: { amber, navy, slate },
  primaryColor: "amber",
  primaryShade: 6,
  fontFamily: "var(--font-inter), sans-serif",
  headings: { fontFamily: "var(--font-inter), sans-serif" },
  defaultRadius: "md",
});
