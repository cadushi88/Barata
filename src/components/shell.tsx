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
      <header className="edge-torn relative z-20 bg-navy pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 lg:h-[4.5rem]">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline" aria-label="Barata home">
            <img src="/favicon.png" alt="" className="tilt-l-sm h-9 w-9 rounded-sm lg:h-10 lg:w-10" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-wide text-navy-fg lg:text-[1.75rem]">Barata</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-navy-fg/55 lg:inline">
                kuantu e ta kosta — how much does it cost
              </span>
            </span>
          </Link>

          <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-1.5 text-sm lg:flex">
            {tabs.map((t) => {
              const on = t.match(pathname);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-1.5 no-underline ${on ? "-rotate-1 bg-highlight font-semibold text-highlight-fg" : "text-navy-fg/70 hover:text-navy-fg hover:underline hover:decoration-dashed hover:decoration-2 hover:underline-offset-4"}`}
                >
                  {t.label}
                </Link>
              );
            })}
            <Link
              to="/plan"
              className={`px-3 py-1.5 no-underline ${pathname.startsWith("/plan") ? "-rotate-1 bg-highlight font-semibold text-highlight-fg" : "text-navy-fg/70 hover:text-navy-fg hover:underline hover:decoration-dashed hover:decoration-2 hover:underline-offset-4"}`}
            >
              Business
            </Link>
            {user ? (
              <Link
                to="/messages"
                className={`px-3 py-1.5 no-underline ${pathname.startsWith("/messages") ? "-rotate-1 bg-highlight font-semibold text-highlight-fg" : "text-navy-fg/70 hover:text-navy-fg hover:underline hover:decoration-dashed hover:decoration-2 hover:underline-offset-4"}`}
              >
                Messages
              </Link>
            ) : null}
            {user ? (
              <Link
                to="/account"
                className={`px-3 py-1.5 no-underline ${pathname.startsWith("/account") ? "-rotate-1 bg-highlight font-semibold text-highlight-fg" : "text-navy-fg/70 hover:text-navy-fg hover:underline hover:decoration-dashed hover:decoration-2 hover:underline-offset-4"}`}
              >
                Account
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                to="/admin"
                className={`px-3 py-1.5 no-underline ${pathname.startsWith("/admin") ? "-rotate-1 bg-highlight font-semibold text-highlight-fg" : "text-navy-fg/70 hover:text-navy-fg hover:underline hover:decoration-dashed hover:decoration-2 hover:underline-offset-4"}`}
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {isPending ? (
              <div className="h-9 w-9 animate-pulse bg-white/10" />
            ) : user ? (
              <SignedIn>
                <UserButton />
              </SignedIn>
            ) : (
              <SignedOut>
                <Link
                  to="/login"
                  className="tilt-r-sm inline-flex h-10 min-w-10 items-center justify-center bg-primary px-4 text-sm font-semibold text-primary-fg no-underline"
                >
                  Sign in
                </Link>
              </SignedOut>
            )}
          </div>
        </div>
      </header>

      <InstallPrompt />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 lg:py-8 lg:pb-10">
        {children}
        <footer className="mt-14 border-t-2 border-dashed border-line pt-4 font-mono text-xs text-faint">
          <p className="tracking-wide">barata · {new Date().getFullYear()} · thank you, come again</p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="text-faint no-underline hover:text-ink hover:underline">
              privacy
            </Link>
            <Link to="/terms" className="text-faint no-underline hover:text-ink hover:underline">
              terms
            </Link>
          </div>
        </footer>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${on ? "text-ink" : "text-faint"}`}
              >
                {on ? <span className="absolute inset-x-3 top-0 h-[3px] bg-highlight" aria-hidden="true" /> : null}
                <Icon size={21} strokeWidth={on ? 2.3 : 1.7} />
                <span className="font-mono text-[10px] font-medium uppercase tracking-wide">{t.label}</span>
              </Link>
            );
          })}
          {isAdmin ? (
            <Link
              to="/admin"
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${pathname.startsWith("/admin") ? "text-ink" : "text-faint"}`}
            >
              {pathname.startsWith("/admin") ? <span className="absolute inset-x-3 top-0 h-[3px] bg-highlight" aria-hidden="true" /> : null}
              <ShieldCheck size={21} strokeWidth={pathname.startsWith("/admin") ? 2.3 : 1.7} />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wide">Admin</span>
            </Link>
          ) : null}
          <Link
            to={user ? "/account" : "/login"}
            className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${pathname.startsWith("/login") || pathname.startsWith("/account") ? "text-ink" : "text-faint"}`}
          >
            {pathname.startsWith("/login") || pathname.startsWith("/account") ? (
              <span className="absolute inset-x-3 top-0 h-[3px] bg-highlight" aria-hidden="true" />
            ) : null}
            <UserRound size={21} strokeWidth={pathname.startsWith("/login") || pathname.startsWith("/account") ? 2.3 : 1.7} />
            <span className="font-mono text-[10px] font-medium uppercase tracking-wide">{user ? "You" : "Sign in"}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
