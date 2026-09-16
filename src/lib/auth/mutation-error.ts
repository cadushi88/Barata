import { useNavigate } from "@tanstack/react-router";
import { SIGN_IN_PATH } from "./gates";

/**
 * Shared `onError` helper for mutations guarded by `authMiddleware`.
 *
 * Server functions throw a plain `Error` whose message is exactly
 * `"Unauthorized"` (see `verify.server.ts`) when the session the client's own
 * cached state THINKS is valid gets rejected server-side — an expired session,
 * or (until the `BETTER_AUTH_SECRET` fix) a session signed by a different
 * serverless instance. Without this, that failure was silent: the button's
 * `onSuccess` never fired, nothing was saved, and the visitor had no idea why.
 *
 * Call the returned function from a mutation's `onError`, then render the
 * message it returns. On an auth failure specifically, it also redirects to
 * sign-in so the visitor can re-authenticate instead of retrying a doomed action.
 */
export function useAuthErrorMessage() {
  const navigate = useNavigate();
  return (err: unknown, fallback = "Something went wrong — try again."): string => {
    if (err instanceof Error && err.message === "Unauthorized") {
      void navigate({ to: SIGN_IN_PATH });
      return "Your session expired — please sign in again.";
    }
    return err instanceof Error && err.message ? err.message : fallback;
  };
}
