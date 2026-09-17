import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "./use-current-user";
import { checkIsAdmin } from "./is-admin";

/**
 * Client-side admin check for showing/hiding admin UI. Asks the server
 * (`checkIsAdmin`) rather than importing the admin allowlist directly — the
 * real security boundary is `adminMiddleware` server-side, but the allowlist
 * itself must never reach the browser bundle either.
 */
export function useIsAdmin(): { isAdmin: boolean; isPending: boolean } {
  const { user, isPending: userPending } = useCurrentUserState();
  const admin = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: () => checkIsAdmin(),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });
  return {
    isAdmin: Boolean(user) && Boolean(admin.data?.isAdmin),
    isPending: userPending || (Boolean(user) && admin.isPending),
  };
}
