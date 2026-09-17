import { Link, useRouterState } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIsAdmin } from "@/lib/auth/use-is-admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstallPrompt } from "@/components/install-prompt";
import { LayoutGrid, Store, ClipboardList, Camera, UserRound, ShieldCheck } from "lucide-react";

const tabs = [
  { to: "/", label: "Catalog", icon: LayoutGrid, match: (p: string) => p === "/" || p.startsWith("/products") },
  { to: "/stores", label: "Stores", icon: Store, match: (p: string) => p.startsWith("/stores") },
  { to: "/list", label: "List", icon: ClipboardList, match: (p: string) => p.startsWith("/list") },
  { to: "/contribute", label: "Add", icon: Camera, match: (p: string) => p.startsWith("/contribute") },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const { isAdmin } = useIsAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-20 bg-navy pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:h-16">
          <Link to="/" className="flex min-w-0 items-baseline gap-2 no-underline">
            <span className="font-display text-xl font-semibold tracking-tight text-navy-fg lg:text-2xl">Barata</span>
            <span className="hidden text-xs text-navy-fg/60 lg:inline">Curaçao prices</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 text-sm lg:flex">
            {tabs.map((t) => {
              const on = t.match(pathname);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`rounded-full px-3 py-2 no-underline ${on ? "bg-primary text-primary-fg" : "text-navy-fg/70 hover:bg-white/10 hover:text-navy-fg"}`}
                >
                  {t.label}
                </Link>
              );
            })}
            <Link
              to="/plan"
              className={`rounded-full px-3 py-2 no-underline ${pathname.startsWith("/plan") ? "bg-primary text-primary-fg" : "text-navy-fg/70 hover:bg-white/10 hover:text-navy-fg"}`}
            >
              Business
            </Link>
            {user ? (
              <Link
                to="/messages"
                className={`rounded-full px-3 py-2 no-underline ${pathname.startsWith("/messages") ? "bg-primary text-primary-fg" : "text-navy-fg/70 hover:bg-white/10 hover:text-navy-fg"}`}
              >
                Messages
              </Link>
            ) : null}
            {user ? (
              <Link
                to="/account"
                className={`rounded-full px-3 py-2 no-underline ${pathname.startsWith("/account") ? "bg-primary text-primary-fg" : "text-navy-fg/70 hover:bg-white/10 hover:text-navy-fg"}`}
              >
                Account
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                to="/admin"
                className={`rounded-full px-3 py-2 no-underline ${pathname.startsWith("/admin") ? "bg-primary text-primary-fg" : "text-navy-fg/70 hover:bg-white/10 hover:text-navy-fg"}`}
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {isPending ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
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
      <div
        className="h-1.5 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--color-primary) 0 14px, color-mix(in srgb, var(--color-primary) 75%, black) 14px 28px)",
        }}
        aria-hidden="true"
      />

      <InstallPrompt />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 lg:py-8 lg:pb-10">
        {children}
        <footer className="mt-12 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-faint">
          <span>© {new Date().getFullYear()} Barata</span>
          <Link to="/privacy" className="text-faint no-underline hover:text-muted hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-faint no-underline hover:text-muted hover:underline">
            Terms
          </Link>
        </footer>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
        aria-label="Primary"
      >
        <div className={`grid ${isAdmin ? "grid-cols-6" : "grid-cols-5"}`}>
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
          {isAdmin ? (
            <Link
              to="/admin"
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${pathname.startsWith("/admin") ? "text-primary" : "text-faint"}`}
            >
              <ShieldCheck size={22} strokeWidth={pathname.startsWith("/admin") ? 2.4 : 1.8} />
              <span className="text-[11px] font-medium">Admin</span>
            </Link>
          ) : null}
          <Link
            to={user ? "/account" : "/login"}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${pathname.startsWith("/login") || pathname.startsWith("/account") ? "text-primary" : "text-faint"}`}
          >
            <UserRound size={22} strokeWidth={pathname.startsWith("/login") || pathname.startsWith("/account") ? 2.4 : 1.8} />
            <span className="text-[11px] font-medium">{user ? "You" : "Sign in"}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
