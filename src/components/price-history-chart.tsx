import { lazy, Suspense } from "react";
import { xcg } from "@/lib/money";

/** Shared with the legend below the chart, so a store's line and its label always match. */
const CHART_COLORS = ["#0E6E5E", "#D98E4A", "#6B7570", "#0A5548", "#B0562F", "#3B6E8F"];

/**
 * `recharts` alone is ~515KB — far more than this one small line chart is worth on
 * every product-page load, most of which never scroll to it. Loading it via
 * `React.lazy()` keeps it out of the product page's initial JS and off the main
 * bundle for every other route entirely; it only downloads once a product with
 * enough price history actually renders this component.
 */
const RechartsPriceHistory = lazy(() =>
  import("recharts").then((m) => ({
    default: function RechartsPriceHistoryImpl({
      series,
      storeNames,
    }: {
      series: Record<string, string | number>[];
      storeNames: string[];
    }) {
      const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = m;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} width={40} />
            <Tooltip formatter={(v: number) => xcg(v)} />
            {storeNames.map((name, i) => (
              <Line
                key={name}
                type="stepAfter"
                dataKey={name}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    },
  })),
);

/** Price-history line chart + store-color legend for the product page. Lazy-loads `recharts`
 * internally (see above) so callers don't need to think about the bundle-size trade-off. */
export function PriceHistoryChart({
  series,
  storeNames,
}: {
  series: Record<string, string | number>[];
  storeNames: string[];
}) {
  return (
    <>
      <div className="mt-3 h-64 w-full">
        <Suspense fallback={<div className="h-full w-full animate-pulse rounded-md bg-line/60" aria-hidden />}>
          <RechartsPriceHistory series={series} storeNames={storeNames} />
        </Suspense>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {storeNames.map((name, i) => (
          <span key={name} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            {name}
          </span>
        ))}
      </div>
    </>
  );
}
