import { createTheme, type MantineColorsTuple } from "@mantine/core";

/*
 * Design system - "Progress teal + achievement orange", Minimalism & Swiss.
 * Source: the ui-ux-pro-max skill's Online Course / E-learning profile, with
 * contrast adjusted to WCAG AA. The written rules are in apps/web/docs/design-system.md.
 *
 * Palette names are kept stable on purpose. `navy` was the old primary and is
 * referenced across ~70 files; it now carries the brand teal, so every screen
 * moves to the new system without each one being edited. The Mantine defaults
 * a few modules reached for directly (indigo, blue, violet, grape, cyan, gray,
 * dark) are folded into the same scales, so the app has one primary hue and one
 * neutral instead of five of each.
 */

/** Brand / primary. 7 is the action shade (white text 5.5:1), 9 headings (9.4:1). */
const brand: MantineColorsTuple = [
  "#F0FDFA",
  "#CCFBF1",
  "#99F6E4",
  "#5EEAD4",
  "#2DD4BF",
  "#14B8A6",
  "#0D9488",
  "#0F766E",
  "#115E59",
  "#134E4A",
];

/**
 * Accent, for the one action that moves the learner on and for achievements.
 * Filled orange buttons get dark text from `autoContrast` (7:1) - white on this
 * orange is 2.8:1 and was the last contrast failure the audit reported.
 */
const orange: MantineColorsTuple = [
  "#FFF7ED",
  "#FFEDD5",
  "#FED7AA",
  "#FDBA74",
  "#FB923C",
  "#F97316",
  "#EA580C",
  "#C2410C",
  "#9A3412",
  "#7C2D12",
];

/** Errors and destructive actions. */
const warn: MantineColorsTuple = [
  "#FEF2F2",
  "#FEE2E2",
  "#FECACA",
  "#FCA5A5",
  "#F87171",
  "#EF4444",
  "#DC2626",
  "#B91C1C",
  "#991B1B",
  "#7F1D1D",
];

/**
 * Neutral (slate). 0 is the page, 2 the hairline border, 5 secondary text
 * (5.5:1 on white, 5:1 on ink-1), 7 body text, 9 the darkest ink.
 */
const ink: MantineColorsTuple = [
  "#F8FAFC",
  "#F1F5F9",
  "#E2E8F0",
  "#CBD5E1",
  "#94A3B8",
  "#5B6A80",
  "#475569",
  "#334155",
  "#1E293B",
  "#0F172A",
];

/** Success / correct answers - a green distinct from the brand teal. */
const green: MantineColorsTuple = [
  "#F0FDF4",
  "#DCFCE7",
  "#BBF7D0",
  "#86EFAC",
  "#4ADE80",
  "#22C55E",
  "#16A34A",
  "#15803D",
  "#166534",
  "#14532D",
];

export const theme = createTheme({
  colors: {
    navy: brand,
    brand,
    ink,
    orange,
    warn,
    green,
    teal: green,
    red: warn,
    yellow: orange,
    indigo: brand,
    blue: brand,
    violet: brand,
    grape: brand,
    cyan: brand,
    gray: ink,
    dark: ink,
  },
  primaryColor: "brand",
  primaryShade: 7,
  // Text on a filled control follows the fill: dark on orange, white on teal.
  autoContrast: true,
  luminanceThreshold: 0.3,
  respectReducedMotion: true,
  focusRing: "auto",
  cursorType: "pointer",
  black: "#0F172A",
  white: "#FFFFFF",
  fontFamily: "var(--font-body), system-ui, sans-serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
  },
  lineHeights: { xs: "1.45", sm: "1.5", md: "1.6", lg: "1.6", xl: "1.55" },
  headings: {
    fontFamily: "var(--font-heading), system-ui, sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "34px", lineHeight: "1.18" },
      h2: { fontSize: "26px", lineHeight: "1.25" },
      h3: { fontSize: "20px", lineHeight: "1.3" },
      h4: { fontSize: "17px", lineHeight: "1.35" },
      h5: { fontSize: "16px", lineHeight: "1.4" },
      h6: { fontSize: "14px", lineHeight: "1.4" },
    },
  },
  // Swiss: small, consistent radii; nothing pill-shaped except badges.
  radius: { xs: "4px", sm: "6px", md: "8px", lg: "10px", xl: "14px" },
  defaultRadius: "md",
  spacing: { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" },
  // Flat surfaces separated by hairlines; elevation only where something
  // genuinely floats (menus, modals, toasts).
  shadows: {
    xs: "none",
    sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
    md: "0 4px 12px rgba(15, 23, 42, 0.08)",
    lg: "0 12px 28px rgba(15, 23, 42, 0.12)",
    xl: "0 20px 44px rgba(15, 23, 42, 0.16)",
  },
  components: {
    Card: {
      defaultProps: { radius: "lg", padding: "lg", withBorder: true },
      styles: {
        root: {
          borderColor: "var(--mantine-color-ink-2)",
          boxShadow: "none",
        },
      },
    },
    Paper: {
      defaultProps: { radius: "lg" },
      styles: { root: { borderColor: "var(--mantine-color-ink-2)" } },
    },
    // Heights live in globals.css (44px touch targets): the theme crosses the
    // server/client boundary, so it can hold values but not `vars` functions.
    Button: {
      defaultProps: { radius: "md", size: "md" },
      styles: {
        root: {
          fontWeight: 600,
          transition:
            "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
        },
      },
    },
    ActionIcon: { defaultProps: { radius: "md" } },
    Input: {
      styles: { input: { borderColor: "var(--mantine-color-ink-3)" } },
    },
    InputWrapper: {
      styles: {
        label: { fontWeight: 600, marginBottom: 4 },
        description: { color: "var(--mantine-color-ink-5)" },
      },
    },
    TextInput: { defaultProps: { size: "md" } },
    PasswordInput: { defaultProps: { size: "md" } },
    NumberInput: { defaultProps: { size: "md" } },
    Select: { defaultProps: { size: "md" } },
    MultiSelect: { defaultProps: { size: "md" } },
    Textarea: { defaultProps: { size: "md" } },
    Badge: {
      defaultProps: { radius: "xl", variant: "light" },
      styles: {
        root: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
      },
    },
    SegmentedControl: { defaultProps: { radius: "md" } },
    Tabs: {
      styles: { tab: { fontWeight: 600, fontSize: "15px" } },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: { backgroundOpacity: 0.45, blur: 0 },
      },
      styles: {
        title: {
          fontFamily: "var(--font-heading), system-ui, sans-serif",
          fontWeight: 600,
          fontSize: "18px",
        },
      },
    },
    Table: {
      styles: {
        th: {
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--mantine-color-ink-6)",
          textTransform: "none",
        },
      },
    },
    Tooltip: { defaultProps: { withArrow: true, radius: "sm" } },
    Menu: {
      defaultProps: { radius: "md", shadow: "md" },
    },
    Popover: { defaultProps: { radius: "md", shadow: "md" } },
    Notification: { defaultProps: { radius: "md" } },
    Progress: { defaultProps: { radius: "xl" } },
    Anchor: { defaultProps: { underline: "hover" } },
    // Labels in lists wrap onto two lines; body line-height spreads them apart.
    NavLink: {
      defaultProps: { radius: "md" },
      styles: {
        label: { lineHeight: 1.35 },
        description: { lineHeight: 1.35 },
      },
    },
  },
});
