/**
 * The web app's palette (apps/web/src/lib/mantine/theme.ts), so both apps read
 * as one product. Index 0 is lightest, 9 darkest, as in Mantine.
 */
export const palette = {
  brand: [
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
  ],
  orange: [
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
  ],
  warn: [
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
  ],
  ink: [
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
  ],
  green: [
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
  ],
} as const;

export const colors = {
  primary: palette.brand[5],
  primaryDark: palette.brand[7],
  primarySoft: palette.brand[0],
  accent: palette.orange[4],
  accentSoft: palette.orange[0],
  danger: palette.warn[6],
  dangerSoft: palette.warn[0],
  success: palette.green[6],
  successSoft: palette.green[0],
  text: palette.ink[9],
  textMuted: palette.ink[6],
  textFaint: palette.ink[4],
  border: palette.ink[2],
  surface: "#FFFFFF",
  background: palette.ink[0],
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;
