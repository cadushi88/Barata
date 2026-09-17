import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy — Barata" }] }),
});

function PrivacyPage() {
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Privacy</h1>
      <p className="mt-2 text-sm text-muted">Last updated {new Date().toLocaleDateString("en-CA")}.</p>

      <div className="mt-6 max-w-2xl space-y-8 text-sm text-muted [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-ink [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>What we collect</h2>
          <ul>
            <li>Your email (and name, if you sign in with Google) — to run your account and sessions.</li>
            <li>Your shopping list — the products and quantities you add.</li>
            <li>Prices you submit — a receipt's text, a manual price report, or a store name/price pair, plus which
              product we matched it to.</li>
            <li>Messages you send us from the app.</li>
          </ul>
          <p>We do not collect payment information, location, or browsing history outside this app.</p>
        </section>

        <section>
          <h2>Receipts and AI</h2>
          <p>
            When you paste receipt text or upload a receipt photo on the Add tab, that text and image are sent to{" "}
            <strong className="text-ink">Anthropic</strong> (the maker of Claude) for one purpose only: reading the
            line items off the receipt — product names, prices, and categories. We do not store the photo itself;
            only the extracted text and the items Claude found are kept, so we can review and, if approved, add them
            to the public catalog.
          </p>
        </section>

        <section>
          <h2>Nothing goes public automatically</h2>
          <p>
            Every price change — from a scraper, a receipt, or a manual report — is held for admin review before it
            appears anywhere in the catalog. Submitting a price never publishes it by itself.
          </p>
        </section>

        <section>
          <h2>How long we keep it</h2>
          <p>
            We keep your account data for as long as your account exists. You can delete your account at any time
            from <Link to="/account">Your account</Link> — this permanently removes your shopping list, receipts,
            messages, and any price submissions still waiting for review. A price report that already went live
            stays in the catalog (other shoppers may be relying on it), but is no longer linked to your account.
          </p>
        </section>

        <section>
          <h2>Who else sees your data</h2>
          <ul>
            <li><strong className="text-ink">Anthropic</strong> — receipt text/photos, for line-item extraction only.</li>
            <li><strong className="text-ink">Neon</strong> (database) and <strong className="text-ink">Vercel</strong> (hosting) — store and serve the app's data.</li>
            <li>Barata's admin — reviews submitted prices, messages, and receipts before they're published or replied to.</li>
          </ul>
          <p>We do not sell your data, and we do not use it for advertising.</p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            Export a copy of everything tied to your account, or delete your account entirely, from{" "}
            <Link to="/account">Your account</Link> — both are self-service, no need to email anyone.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            Send us a message from the app (sign in, then the Messages page) and we'll get back to you.
          </p>
        </section>
      </div>
    </Shell>
  );
}
