import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { AdminNav } from "@/components/admin-nav";
import { RequireAdmin } from "@/lib/auth/gates";

/**
 * Layout for every `/admin/*` page — gating, the Shell chrome, and the
 * section nav live here ONCE. A dot-notation file (`admin.tsx`) automatically
 * becomes the parent of every `admin.*.tsx` sibling, so each of those must
 * render only its own page content and rely on `<Outlet />` here rather than
 * wrapping itself again (a page that also renders `<Shell>`/`<RequireAdmin>`
 * would nest two headers/redirects, not one).
 */
export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  return (
    <RequireAdmin>
      <Shell>
        <AdminNav />
        <Outlet />
      </Shell>
    </RequireAdmin>
  );
}
