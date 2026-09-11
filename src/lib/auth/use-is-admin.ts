import { useCurrentUserState } from "./use-current-user";
import { isAdminEmail } from "./admin-email";

/** Client-side admin check for showing/hiding admin UI. The real security boundary is `adminMiddleware` server-side — this is display only. */
export function useIsAdmin(): { isAdmin: boolean; isPending: boolean } {
  const { user, isPending } = useCurrentUserState();
  return { isAdmin: isAdminEmail(user?.primaryEmail), isPending };
}
