import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, authClient, signIn } from "@/lib/auth/client";
import { useState } from "react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const r = await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
        if (r.error) throw new Error(r.error.message || "Sign up failed");
      } else {
        const r = await authClient.signIn.email({ email, password });
        if (r.error) throw new Error(r.error.message || "Sign in failed");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-10 pb-8 text-ink">
      <div className="w-full max-w-sm space-y-5 rounded-[28px] border border-line bg-surface p-6">
        <div>
          <Link to="/" className="font-display text-2xl font-semibold text-ink no-underline">
            Barata
          </Link>
          <p className="mt-1 text-sm text-muted">Save your list and contribute live prices.</p>
        </div>
        {authEnabled ? (
          <>
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-medium hover:bg-line/40"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-line" />
              or email
              <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={onEmail} className="space-y-3">
              {mode === "up" ? (
                <input
                  className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : null}
              <input
                className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm"
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm"
                type="password"
                required
                minLength={8}
                placeholder="Password (8+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error ? <p className="text-sm text-warn">{error}</p> : null}
              <button
                type="submit"
                disabled={busy}
                className="h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-fg disabled:opacity-60"
              >
                {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
              </button>
            </form>
            <button
              type="button"
              className="w-full text-sm text-muted"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
            >
              {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
