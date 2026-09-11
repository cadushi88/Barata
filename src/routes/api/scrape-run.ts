import { createFileRoute } from "@tanstack/react-router";
import { runScrapeAndStage } from "@/lib/server/scrapers/run";

/**
 * Cron entry point for the store-webshop scraper — `vercel.json` schedules
 * a daily GET here. Protected by a shared secret rather than the app's user
 * auth, since Vercel Cron calls this directly with no browser session:
 * Vercel signs its own cron requests with a bearer token matching the
 * `CRON_SECRET` env var automatically, so setting that var is all that's
 * needed to lock this down (unset in dev — no gate there).
 */
export const Route = createFileRoute("/api/scrape-run")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        const summary = await runScrapeAndStage("cron");
        return new Response(JSON.stringify(summary), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
