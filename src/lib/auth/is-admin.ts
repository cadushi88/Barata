import { createServerFn, createMiddleware } from "@tanstack/react-start";

/**
 * Display-only "am I admin" check for client UI (e.g. the Admin nav tab) —
 * never throws, just resolves `{ isAdmin: false }` when signed out or not the
 * admin. The real security boundary is still `adminMiddleware` on every
 * admin-only server function; this only decides what the client shows.
 *
 * Deliberately NOT named `*.server.ts` and not importing one at the top
 * level: TanStack Start's import-protection treats any `*.server.ts` file as
 * fully off-limits to client code, at the whole-file level — even a
 * `createServerFn`-wrapped export — so this file (imported by the client
 * hook `use-is-admin.ts`) stays plain, and only reaches into `verify.server`
 * / `admin-email` via a dynamic import inside the handler, same as
 * `admin-middleware.ts` does for its own `.server()` block.
 */
const bearerForwardMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { getBearerToken } = await import("./client");
  return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
});

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([bearerForwardMiddleware])
  .handler(async ({ context }) => {
    const { getSessionUser } = await import("./verify.server");
    const { isAdminEmail } = await import("./admin-email");
    const user = await getSessionUser(context.bearerToken);
    return { isAdmin: Boolean(user && isAdminEmail(user.email)) };
  });
