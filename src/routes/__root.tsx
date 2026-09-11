import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
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
});

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
