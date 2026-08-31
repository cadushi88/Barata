import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  return (
    <Shell>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Founder brief · Aug 2026</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">Barata business plan</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted md:text-base">
        A Curaçao-first grocery price comparison app. Crowdsourced receipts plus a seeded catalog, because most island
        stores do not publish a usable API.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">The problem</h2>
        <p className="max-w-2xl text-muted">
          Fundashon pa Konsumidó (30 Apr 2026) compared 95 meat, fruit and vegetable items across 15 supermarkets.
          Shoulder ham was XCG 39.99 at Van den Tweel and XCG 18.75 at Esperamos — a XCG 21 gap on one kilo.
          Sirloin was XCG 37.90 at Mangusa and XCG 22.50 at Vreugdenhil. Mangusa Hypermarket and Mangusa Rio Canario
          were cheapest on 34 products each. Food CPI still rose 2.2% in 2025. There is no island-wide live comparison
          app. Flipp / Basket / GroceryChop do not cover Curaçao.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Product</h2>
        <ul className="max-w-2xl list-disc space-y-1 pl-5 text-muted">
          <li>Public catalog of staples with latest price per store</li>
          <li>Basket optimizer: one list, twelve store totals</li>
          <li>Manual price reports (signed-in)</li>
          <li>Receipt paste / photo → Grok extracts, sorts by category and price, matches SKUs</li>
          <li>Accounts: Google, X, or email</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Market</h2>
        <p className="max-w-2xl text-muted">
          Curaçao ~155k residents, high import share, tourism traffic, and a culture of hopping between Mangusa,
          Centrum, Goisco and neighborhood stores. Expand later to Aruba and Bonaire (same currency XCG, similar
          banners). Global grocery comparison is crowded; ABC islands are empty.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">How it makes money</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card title="Free consumer app" body="Catalog, compare, list. Growth engine. Ads only if they stay quiet (store flyers, not junk)." />
          <Card title="Barata Plus · XCG 9 / mo" body="Price-drop alerts, 90-day history, unlimited receipt scans, export. Target 3–5% of actives." />
          <Card title="Retail intel" body="Anonymized index sold to stores and importers: ‘you are 12% above Mangusa on dairy’. XCG 400–1,200 / mo per banner." />
          <Card title="Affiliate / delivery" body="Deep-link to Pidii or store e-commerce when a basket wins. 3–8% of referred GMV." />
        </div>
        <p className="max-w-2xl text-sm text-muted">
          Year-1 conservative: 8,000 MAU, 250 Plus subscribers (XCG 27k ARR), 2 retail seats (XCG 15k), leftover ads.
          Break-even is possible under XCG 80k revenue if the team stays founder-led.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Starting capital</h2>
        <p className="text-sm text-muted">Lean Curaçao BV, this web app as MVP (native later). Figures in USD.</p>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Curaçao BV + KvK + vestigingsvergunning + CRIB", "$3,500 – $6,000"],
                ["Domain, hosting, database (year 1)", "$200 – $600"],
                ["Apple + Google developer accounts (when you wrap native)", "$124"],
                ["xAI / OCR usage buffer", "$300 – $800"],
                ["Legal templates, privacy, terms", "$400 – $1,000"],
                ["Seed field work (shoppers photographing 4 weeks of receipts)", "$800 – $1,500"],
                ["Launch marketing (FB/IG local, radio spot, WhatsApp groups)", "$1,500 – $3,000"],
                ["Contingency 15%", "$1,000 – $1,800"],
                ["Recommended raise / savings to start", "$8,000 – $15,000"],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-line first:border-0">
                  <td className="px-4 py-3">{k}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-sm text-muted">
          This is far below a gift-card / eSIM inventory business because there is no float. The scarce resource is
          trusted prices, not stock. Do not spend on a custom native app until 1,000 weekly active shoppers exist.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Legal (Curaçao)</h2>
        <ul className="max-w-2xl list-disc space-y-1 pl-5 text-muted">
          <li>Form a BV, register KvK, vestigingsvergunning, CRIB</li>
          <li>Profit tax 15% / 22% territorial; OB 6% on local B2C subscriptions</li>
          <li>Privacy: receipts can contain payment fragments — strip PAN, store only line items</li>
          <li>Do not scrape store sites against robots.txt; crowdsource instead</li>
          <li>Trademark “Barata” in the Caribbean before ads</li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-2xl">Go-to-market (low budget)</h2>
        <ol className="max-w-2xl list-decimal space-y-1 pl-5 text-muted">
          <li>Seed 80 SKUs (done) then pay 10 shoppers XCG 25 to upload one receipt each week</li>
          <li>Partner Fundashon pa Konsumidó — they already publish quarterly surveys</li>
          <li>WhatsApp status + Facebook groups (expats, “Kòrsou deals”)</li>
          <li>One weekly “cheapest chicken” story for local radio / Chronicle</li>
          <li>Tourist angle: hotel racks and DushiCars-style blogs already rank for “Curaçao grocery stores”</li>
        </ol>
      </section>

      <section className="mt-10 space-y-3 pb-8">
        <h2 className="font-display text-2xl">Risks</h2>
        <p className="max-w-2xl text-muted">
          Cold-start of prices, stale data, SKU mismatch (brand vs house brand), store hostility, tiny TAM unless you
          add Aruba/Bonaire, and AI cost if receipt photos are unbounded. Mitigations: sign-in gate on AI, match
          threshold, decay old prices visually, and sell the index so retailers want you alive.
        </p>
      </section>
    </Shell>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
