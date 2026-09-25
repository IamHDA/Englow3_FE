import { createTheme, type MantineColorsTuple } from "@mantine/core";

/** Deep blue used as the site's primary colour — brand, links, secondary actions. */
const navy: MantineColorsTuple = [
  "#E9EEFB",
  "#C9D5F2",
  "#A8BBE8",
  "#84A2E1",
  "#5F88DB",
  "#3B6FD4",
  "#335EBE",
  "#2A4CA8",
  "#244399",
  "#1E3A8A",
];

/** Warm accent reserved for CTAs, progress and highlighted figures. */
const orange: MantineColorsTuple = [
  "#FFF7EA",
  "#FDEFDC",
  "#FAD79E",
  "#F8BE61",
  "#F5A623",
  "#F08A0C",
  "#D97706",
  "#C26400",
  "#9C5000",
  "#7A3F00",
];

/** Error/warning red used for form validation states. */
const warn: MantineColorsTuple = [
  "#FDF2F1",
  "#FAE0DD",
  "#F3BEB8",
  "#EA9A91",
  "#E0776A",
  "#DA5C4C",
  "#D9483B",
  "#B93A2F",
  "#922E26",
  "#6E231D",
];

/** Neutral scale carrying body copy, borders and surfaces. */
const ink: MantineColorsTuple = [
  "#F4F6FA",
  "#ECEFF5",
  "#E3E8F0",
  "#C5CBD7",
  "#A6AFBF",
  "#8892A6",
  "#6E7990",
  "#54607A",
  "#384359",
  "#1B2540",
];

/**
 * The design system, in one place.
 *
 * Direction: a clean study tool in the manner of Study4 and Duolingo - white
 * cards with a hairline border on a light grey page, generous rounding, navy
 * for structure and orange kept for the one action that moves the learner on.
 * Components get their look from the defaults below, so a screen that uses a
 * plain <Card> or <Button> is already on-style and nothing is restyled page by
 * page.
 */
export const theme = createTheme({
  colors: { navy, ink, orange, warn },
  primaryColor: "navy",
  primaryShade: 9,
  fontFamily: "var(--font-work-sans), sans-serif",
  fontSizes: {
    xs: "12px",
    sm: "13px",
    md: "14px",
    lg: "16px",
    xl: "18px",
  },
  lineHeights: { xs: "1.4", sm: "1.45", md: "1.55", lg: "1.6", xl: "1.6" },
  headings: {
    fontFamily: "var(--font-work-sans), sans-serif",
    fontWeight: "800",
    sizes: {
      h1: { fontSize: "30px", lineHeight: "1.2" },
      h2: { fontSize: "24px", lineHeight: "1.25" },
      h3: { fontSize: "19px", lineHeight: "1.3", fontWeight: "700" },
      h4: { fontSize: "16px", lineHeight: "1.35", fontWeight: "700" },
      h5: { fontSize: "15px", lineHeight: "1.4", fontWeight: "700" },
      h6: { fontSize: "14px", lineHeight: "1.4", fontWeight: "700" },
    },
  },
  radius: { xs: "6px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  defaultRadius: "md",
  shadows: {
    xs: "0 1px 2px rgba(27, 37, 64, 0.04)",
    sm: "0 2px 8px rgba(27, 37, 64, 0.06)",
    md: "0 8px 24px -8px rgba(27, 37, 64, 0.14)",
    lg: "0 18px 40px -16px rgba(27, 37, 64, 0.22)",
    xl: "0 28px 60px -20px rgba(27, 37, 64, 0.28)",
  },
  components: {
    // The unit of every screen: white, hairline border, soft lift.
    Card: {
      defaultProps: { radius: "lg", padding: "lg", withBorder: true },
      styles: {
        root: {
          borderColor: "var(--mantine-color-ink-1)",
          boxShadow: "var(--mantine-shadow-xs)",
        },
      },
    },
    Paper: {
      defaultProps: { radius: "lg" },
      styles: { root: { borderColor: "var(--mantine-color-ink-1)" } },
    },
    Button: {
      defaultProps: { radius: "md" },
      styles: { root: { fontWeight: 600 } },
    },
    ActionIcon: { defaultProps: { radius: "md" } },
    Badge: {
      defaultProps: { radius: "sm", variant: "light" },
      styles: { root: { textTransform: "none", fontWeight: 600 } },
    },
    SegmentedControl: { defaultProps: { radius: "md" } },
    Tabs: { styles: { tab: { fontWeight: 600 } } },
    Modal: { defaultProps: { radius: "lg", centered: true } },
    Table: {
      styles: {
        th: {
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--mantine-color-ink-6)",
        },
      },
    },
    Tooltip: { defaultProps: { withArrow: true, radius: "sm" } },
  },
});
