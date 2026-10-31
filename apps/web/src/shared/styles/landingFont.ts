import { Montserrat } from "next/font/google";

/** The public welcome page follows the reference; app typography stays unchanged. */
export const landingFont = Montserrat({
  variable: "--font-landing",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});
