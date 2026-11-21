import { Ban, Send, UserPlus, Users, type LucideIcon } from "lucide-react";

import type { FriendsSection } from "./friends";

/** The icon beside each list in the side menu. */
export const FRIENDS_SECTION_ICONS: Record<FriendsSection, LucideIcon> = {
  friends: Users,
  requests: UserPlus,
  sent: Send,
  blocked: Ban,
};
