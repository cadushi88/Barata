/**
 * The single admin account for this app. Deliberately hardcoded rather than
 * a database role — Barata has exactly one operator, and a literal is one
 * fewer thing that can be misconfigured (an empty/unset env var silently
 * granting nobody, or everybody, admin access).
 */
export const ADMIN_EMAIL = "carlosrudolph88@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email!.toLowerCase() === ADMIN_EMAIL;
}
