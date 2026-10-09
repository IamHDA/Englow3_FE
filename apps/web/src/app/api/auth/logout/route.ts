import { z } from "zod";

import {
  createSupabaseServerClient,
  rememberSessionPreference,
} from "@/lib/supabase/server";
import { authFailure, authSuccess, readAuthRequest } from "@/server/authRoute";

export const dynamic = "force-dynamic";

/** Ends the session on this browser and clears its cookies. */
export async function POST(request: Request) {
  const read = await readAuthRequest(request, z.object({}).passthrough());
  if (!read.ok) return read.response;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  await rememberSessionPreference(false);
  if (error) return authFailure(error);

  return authSuccess();
}
