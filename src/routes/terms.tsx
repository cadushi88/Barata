import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms — Barata" }] }),
});

function TermsPage() {
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Terms of use</h1>
      <p className="mt-2 text-sm text-muted">Last updated {new Date().toLocaleDateString("en-CA")}.</p>

      <div className="mt-6 max-w-2xl space-y-8 text-sm text-muted [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-ink [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
        <section>
          <h2>What Barata is</h2>
          <p>
            Barata compares grocery prices across Curaçao supermarkets, using a mix of catalog data, admin-run
            scrapes, and prices shoppers submit themselves. It's a community reference, not an official price
            registry for any store.
          </p>
        </section>

        <section>
          <h2>Prices aren't guaranteed</h2>
          <p>
            Prices shown may be out of date, wrong, or no longer offered by the time you shop — stores change
            prices without notice, and even reviewed submissions can contain mistakes. Always confirm the price
            in-store or on the store's own channel before relying on it for a purchase decision. Barata makes no
            guarantee of accuracy, availability, or completeness.
          </p>
        </section>

        <section>
          <h2>Contributing prices</h2>
          <p>
            When you submit a receipt, a manual price, or upload a photo, you're telling us you believe it's
            accurate and that you're allowed to share it. Every submission is reviewed by an admin before it can
            appear in the public catalog — we may edit, decline, or remove any submission at our discretion,
            including after it's been published.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <ul>
            <li>Don't submit prices you know to be false or misleading.</li>
            <li>Don't use automated tools to scrape, spam, or abuse the app or its review queue.</li>
            <li>Don't upload receipts or photos that aren't yours to share.</li>
            <li>Don't use the messages feature to harass or send unlawful content.</li>
          </ul>
          <p>We may suspend or delete an account that violates these terms.</p>
        </section>

        <section>
          <h2>Accounts</h2>
          <p>
            You're responsible for keeping your login credentials to yourself. You can delete your account and its
            data at any time from <Link to="/account">Your account</Link> — see our{" "}
            <Link to="/privacy">Privacy policy</Link> for exactly what that removes.
          </p>
        </section>

        <section>
          <h2>No liability</h2>
          <p>
            Barata is provided "as is," with no warranty of any kind. We aren't liable for purchasing decisions,
            losses, or damages arising from using prices or information shown in the app.
          </p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>We may update these terms as the app evolves. Continuing to use Barata after a change means you accept the update.</p>
        </section>
      </div>
    </Shell>
  );
}
