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

export const theme = createTheme({
  colors: { navy, ink, orange, warn },
  primaryColor: "navy",
  primaryShade: 9,
  fontFamily: "var(--font-work-sans), sans-serif",
  headings: { fontFamily: "var(--font-work-sans), sans-serif" },
  fontSizes: { md: "14px" },
  radius: { md: "12px" },
  defaultRadius: "md",
});
