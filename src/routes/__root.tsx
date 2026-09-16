import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { CRASH_GUARD_SCRIPT } from "@/lib/crash-guard";
import appCss from "../styles.css?url";

const APP_NAME = "Barata";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0d0d0e", media: "(prefers-color-scheme: dark)" },
      { name: "description", content: "Compare supermarket prices across Curaçao. Find who is cheapest." },
    ],
    scripts: [{ children: THEME_INIT_SCRIPT }, { children: CRASH_GUARD_SCRIPT }],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Bebas+Neue&display=swap",
      },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
});

/**
 * Route-tree-wide safety net: catches an error thrown during render/loader for
 * any route (TanStack Router wraps every route in a CatchBoundary and bubbles
 * an uncaught error up to the nearest ancestor's `errorComponent`, so this one
 * on the root route is the last stop before the page goes fully blank). Keeps
 * the header/shell chrome intact and offers a same-page recovery via `reset()`
 * instead of a full reload. `crash-guard.ts` remains the fallback for crashes
 * outside React's tree entirely (e.g. a stale JS chunk failing to load) - the
 * two don't conflict, this one simply catches more cases first.
 */
function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-2xl tracking-wide text-primary">Barata</p>
      <h1 className="max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-ink md:text-3xl">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-muted">
        This page hit a snag loading. It's on our side, not yours — try again, or head back home.
      </p>
      {error instanceof Error && error.message ? (
        <p className="max-w-sm break-words rounded-md border border-line bg-surface px-3 py-2 text-xs text-faint">
          {error.message}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-fg"
        >
          Try again
        </button>
        <Link
          to="/"
          className="h-11 rounded-full border border-line px-5 text-sm font-medium text-ink no-underline inline-flex items-center"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}

function RootNotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-2xl tracking-wide text-primary">Barata</p>
      <h1 className="max-w-md font-display text-2xl font-semibold leading-tight tracking-tight text-ink md:text-3xl">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-muted">We couldn't find what you were looking for.</p>
      <Link
        to="/"
        className="mt-2 h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-fg no-underline inline-flex items-center"
      >
        Back to catalog
      </Link>
    </div>
  );
}

function RootComponent() {
  const [client] = useState(() => new QueryClient());
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <QueryClientProvider client={client}>
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
