import { dbSource } from "@/lib/db";

/**
 * Server-only admin allowlist. NEVER import this from client code — the whole
 * point is that the admin email list is not reachable from the browser
 * bundle. Client UI (e.g. showing/hiding the Admin nav tab) asks the server
 * via `checkIsAdmin` (`./admin.server`) instead of importing this list.
 */
if (typeof window !== "undefined") {
  throw new Error("@/lib/auth/admin-email is server-only — never import it from client code.");
}

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

// A real database means a real deployment — an unset ADMIN_EMAILS there means
// nobody could ever reach /admin, which is a deploy misconfiguration worth
// failing loudly for (same reasoning as BETTER_AUTH_SECRET in ./server.ts).
// Locally/preview (PGLite, no DATABASE_URL) an empty allowlist just means
// nobody is admin yet — not fatal, since there's no real data at stake.
if (adminEmails.size === 0 && dbSource === "neon") {
  throw new Error(
    "ADMIN_EMAILS is not set. A real database (DATABASE_URL) is configured, so " +
      "refusing to start with no admin account configured — nobody could ever " +
      "reach /admin. Set ADMIN_EMAILS (comma-separated email addresses) in your " +
      "deployment environment and redeploy.",
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && adminEmails.has(email!.toLowerCase());
}
