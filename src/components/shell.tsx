import { Link, useRouterState } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LayoutGrid, Store, ClipboardList, Camera, UserRound } from "lucide-react";

const tabs = [
  { to: "/", label: "Catalog", icon: LayoutGrid, match: (p: string) => p === "/" || p.startsWith("/products") },
  { to: "/stores", label: "Stores", icon: Store, match: (p: string) => p.startsWith("/stores") },
  { to: "/list", label: "List", icon: ClipboardList, match: (p: string) => p.startsWith("/list") },
  { to: "/contribute", label: "Add", icon: Camera, match: (p: string) => p.startsWith("/contribute") },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:h-16">
          <Link to="/" className="flex min-w-0 items-baseline gap-2 no-underline">
            <span className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">Barata</span>
            <span className="hidden text-xs text-muted lg:inline">Curaçao prices</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 text-sm md:flex">
            {tabs.map((t) => {
              const on = t.match(pathname);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`rounded-full px-3 py-2 no-underline ${on ? "bg-ink text-bg" : "text-muted hover:bg-surface hover:text-ink"}`}
                >
                  {t.label}
                </Link>
              );
            })}
            <Link
              to="/plan"
              className={`rounded-full px-3 py-2 no-underline ${pathname.startsWith("/plan") ? "bg-ink text-bg" : "text-muted hover:bg-surface hover:text-ink"}`}
            >
              Business
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isPending ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-line" />
            ) : user ? (
              <SignedIn>
                <UserButton />
              </SignedIn>
            ) : (
              <SignedOut>
                <Link
                  to="/login"
                  className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-fg no-underline"
                >
                  Sign in
                </Link>
              </SignedOut>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 md:py-8 md:pb-10">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const on = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${on ? "text-primary" : "text-faint"}`}
              >
                <Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
                <span className="text-[11px] font-medium">{t.label}</span>
              </Link>
            );
          })}
          <Link
            to={user ? "/plan" : "/login"}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${pathname.startsWith("/login") || pathname.startsWith("/plan") ? "text-primary" : "text-faint"}`}
          >
            <UserRound size={22} strokeWidth={pathname.startsWith("/login") || pathname.startsWith("/plan") ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium">{user ? "You" : "Sign in"}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
