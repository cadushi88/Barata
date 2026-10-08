import { useEffect, useState } from "react";

const SEEN_KEY = "barata-intro-seen";

export function IntroSplash() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "leaving">("hidden");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // storage unavailable (private mode, blocked site data) — show it anyway,
      // it just won't be remembered for the next tab in this session.
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdMs = reduced ? 250 : 2600;
    const fadeMs = reduced ? 150 : 400;

    setPhase("visible");
    const leave = setTimeout(() => setPhase("leaving"), holdMs);
    const remove = setTimeout(() => setPhase("hidden"), holdMs + fadeMs);
    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-navy transition-opacity duration-[400ms] ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative h-[150px] w-[150px]">
        <span className="intro-corner intro-corner-tl" />
        <span className="intro-corner intro-corner-tr" />
        <span className="intro-corner intro-corner-bl" />
        <span className="intro-corner intro-corner-br" />
        <span className="intro-scan-line" />
        <img src="/favicon.png" alt="" className="relative z-[1] h-full w-full rounded-xl" />
      </div>
      <div className="text-center">
        <p className="font-display text-2xl tracking-wide text-navy-fg">barata</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-navy-fg/60">
          checking today&rsquo;s prices&hellip;
        </p>
      </div>
    </div>
  );
}
