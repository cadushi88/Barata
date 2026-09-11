import { getSessionUser, UnauthorizedError } from "./verify.server";
import { isAdminEmail } from "./admin-email";

/** Thrown when the caller is signed in but not the admin account. Carries `status: 403`. */
export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/**
 * Resolves the signed-in admin, or throws — `UnauthorizedError` (401) when
 * signed out, `ForbiddenError` (403) when signed in as anyone else. Prefer
 * `adminMiddleware` (`./admin-middleware`), which calls this for you.
 */
export async function requireAdmin(bearerToken?: string): Promise<{ id: string; email: string }> {
  const user = await getSessionUser(bearerToken);
  if (!user) throw new UnauthorizedError();
  if (!isAdminEmail(user.email)) throw new ForbiddenError();
  return { id: user.id, email: user.email as string };
}
