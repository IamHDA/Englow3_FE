import { Redirect } from "expo-router";

/** The web's /study/daily-path; on mobile the daily path is the home tab. */
export default function DailyPathRedirect() {
  return <Redirect href="/" />;
}
