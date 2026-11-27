// The profile screen, for its route only.
//
// Kept out of the "@/features/account" barrel: the root layout and the header
// import that barrel for the provider and `useAccountProfile`, and through it
// the whole profile page - its form, schema, avatar picker and tabs, with
// react-hook-form and zod - was in the code every page loads. Same pattern as
// "@/features/chat/header".
export { ProfileView } from "./components/views/ProfileView";
export { ProfileSkeleton } from "./components/blocks/ProfileSkeleton";
