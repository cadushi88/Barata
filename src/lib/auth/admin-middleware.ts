import { createMiddleware } from "@tanstack/react-start";

/**
 * Like `authMiddleware` (`./middleware`), but additionally requires the
 * caller to be the single hardcoded admin account (`./admin-email`). Use on
 * every admin-only server function — never gate admin data with
 * `authMiddleware` alone, which only proves *someone* is signed in, not that
 * they're the admin.
 *
 *   .middleware([adminMiddleware])
 *   .handler(async ({ context }) => { ... context.userId is the admin ... })
 */
export const adminMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireAdmin } = await import("./admin.server");
    assertSameSiteRequest();
    const admin = await requireAdmin(context.bearerToken);
    return next({ context: { userId: admin.id, adminEmail: admin.email } });
  });
