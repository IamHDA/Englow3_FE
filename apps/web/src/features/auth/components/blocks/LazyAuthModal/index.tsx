"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { AuthModalProps } from "../AuthModal";

/*
 * The sign-in and sign-up forms bring react-hook-form, zod and their resolvers.
 * The header (and the home page's call to action) is on every page, but the
 * forms are needed only once someone asks to sign in - most visitors never do,
 * and a signed-in learner never does. So their code is fetched on the first
 * open, not with every page.
 */
const AuthModal = dynamic(
  () => import("../AuthModal").then((module) => module.AuthModal),
  { ssr: false },
);

/**
 * The sign-in modal, loaded the first time it opens. Kept mounted after that,
 * so it closes with its transition and reopens at once.
 */
export function LazyAuthModal(props: AuthModalProps) {
  const [wanted, setWanted] = useState(props.opened);
  // Remembering the first open while rendering, not in an effect: the modal
  // has to start loading on the very render that asks for it.
  if (props.opened && !wanted) setWanted(true);
  if (!wanted) return null;
  return <AuthModal {...props} />;
}
