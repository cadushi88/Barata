import { Link, useRouterState } from "@tanstack/react-router";

const sections = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/prices", label: "Price approvals" },
  { to: "/admin/receipts", label: "Receipts" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/scrape-review", label: "Scraper runs" },
] as const;

export function AdminNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sections.map((s) => {
        const on = s.to === "/admin" ? pathname === "/admin" : pathname.startsWith(s.to);
        return (
          <Link
            key={s.to}
            to={s.to}
            className={`h-9 shrink-0 rounded-full px-3 text-sm no-underline ${
              on ? "bg-ink text-bg" : "border border-line bg-surface text-muted"
            } flex items-center`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
