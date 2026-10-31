import { createTheme, type MantineColorsTuple } from "@mantine/core";

/*
 * Design system - "Logo navy + flame orange", Minimalism & Swiss. Hues are
 * sampled from the Englow3 logo; roles and contrast rules come from the
 * ui-ux-pro-max skill, adjusted to WCAG AA. The written rules are in apps/web/docs/design-system.md.
 *
 * Palette names are kept stable on purpose. `navy` was the old primary and is
 * referenced across ~70 files; it now carries the brand blue, so every screen
 * moves to the new system without each one being edited. The Mantine defaults
 * a few modules reached for directly (indigo, blue, violet, grape, cyan, gray,
 * dark) are folded into the same scales, so the app has one primary hue and one
 * neutral instead of five of each.
 */

/**
 * Brand / primary - the logo's ring, ocean blue (5, #2F7BAD) to deep navy
 * (9, #1F2A60). 7 is the action shade (white text 7.2:1), 9 headings (13.5:1).
 */
const brand: MantineColorsTuple = [
  "#EEF5FA",
  "#D6E7F2",
  "#ADCFE5",
  "#7FB3D4",
  "#5596C2",
  "#2F7BAD",
  "#296A9F",
  "#255A8E",
  "#22427A",
  "#1F2A60",
];

/**
 * Accent - the logo's flame: gold tip (3, #F6BB1F), body (5, #EF800C), base
 * (6, #D65909). For the one action that moves the learner on and for
 * achievements. 7 is the action shade: filled orange buttons resolve to it
 * through `primaryShade` and take white text from `autoContrast` (4.8:1) -
 * white on 5 is only 2.7:1, so 5 and 6 are for fills without text. 7 is also
 * orange used as text (4.9:1 on white).
 */
const orange: MantineColorsTuple = [
  "#FFF6EA",
  "#FFEBCF",
  "#FCD58F",
  "#F6BB1F",
  "#F39A15",
  "#EF800C",
  "#D65909",
  "#C24C0A",
  "#9C3D0A",
  "#6E2C0D",
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
 * Neutral, tinted toward the brand navy so greys sit with it. 0 is the page,
 * 2 the hairline border, 5 secondary text (5.8:1 on white, 5.1:1 on ink-1),
 * 7 body text, 9 the darkest ink.
 */
const ink: MantineColorsTuple = [
  "#F6F8FB",
  "#EEF1F6",
  "#E1E6EF",
  "#C8D0DE",
  "#97A2B8",
  "#5A6680",
  "#46526C",
  "#343F58",
  "#222C45",
  "#121A33",
];

/** Success / correct answers - a green distinct from the brand blue. */
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
  // Text on a filled control follows the fill: white on the action shades of
  // blue and orange, dark on the light tints.
  autoContrast: true,
  luminanceThreshold: 0.3,
  respectReducedMotion: true,
  focusRing: "auto",
  cursorType: "pointer",
  black: "#121A33",
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
    sm: "0 1px 2px rgba(18, 26, 51, 0.06)",
    md: "0 4px 12px rgba(18, 26, 51, 0.08)",
    lg: "0 12px 28px rgba(18, 26, 51, 0.12)",
    xl: "0 20px 44px rgba(18, 26, 51, 0.16)",
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
