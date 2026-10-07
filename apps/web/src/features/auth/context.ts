"use client";
import { createContext } from "react";
import type { AuthSession } from "./types";
export const AuthContext = createContext<{
  session: AuthSession | null;
  signOut: () => Promise<void>;
} | null>(null);
