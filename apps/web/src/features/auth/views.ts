// The forgot-password and reset-password screens, for their routes only.
//
// Kept out of the "@/features/auth" barrel: the root layout and the header
// import that barrel for the provider and `useAuth`, and through it these two
// forms (react-hook-form, zod) were in the code every page loads. Same pattern
// as "@/features/chat/header".
export { ForgotPasswordView } from "./components/views/ForgotPasswordView";
export { ResetPasswordView } from "./components/views/ResetPasswordView";
