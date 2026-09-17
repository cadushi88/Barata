import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { exportMyData, deleteMyAccount } from "@/lib/server/account";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Your account — Barata" }] }),
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const exportData = useMutation({
    mutationFn: () => exportMyData(),
    onSuccess: (data) => {
      setExportError(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "barata-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => setExportError("Couldn't export your data — try again."),
  });

  const deleteAccount = useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: () => {
      void signOut("/");
    },
    onError: () => setDeleteError("Couldn't delete your account — try again, or message us from the Add tab."),
  });

  if (isPending) {
    return (
      <Shell>
        <div className="h-32 animate-pulse rounded-md bg-line/60" />
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Your account</h1>
      <div className="mt-4 rounded-md border border-line bg-surface p-4 text-sm">
        <div className="font-medium text-ink">{user.displayName ?? "—"}</div>
        <div className="text-muted">{user.primaryEmail ?? "—"}</div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl">Your data</h2>
        <p className="mt-1 text-sm text-muted">
          See what we collect and why in our <Link to="/privacy">Privacy policy</Link>.
        </p>
        <button
          type="button"
          disabled={exportData.isPending}
          className="mt-3 h-10 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:opacity-60"
          onClick={() => exportData.mutate()}
        >
          {exportData.isPending ? "Preparing export…" : "Export my data (JSON)"}
        </button>
        {exportError ? (
          <p role="alert" className="mt-2 text-sm text-warn">
            {exportError}
          </p>
        ) : null}
      </section>

      <section className="mt-10 rounded-md border border-warn/30 bg-warn/5 p-4">
        <h2 className="font-display text-xl text-warn">Delete account</h2>
        <p className="mt-1 text-sm text-muted">
          Permanently deletes your shopping list, receipts, messages, and any pending price submissions. Price
          reports you made that already went live stay in the catalog for other shoppers, but are no longer linked
          to your account.
        </p>
        {!confirming ? (
          <button
            type="button"
            className="mt-3 h-10 rounded-lg border border-warn px-4 text-sm font-medium text-warn"
            onClick={() => setConfirming(true)}
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-warn">This cannot be undone. Are you sure?</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={deleteAccount.isPending}
                className="h-10 rounded-lg border-2 border-warn bg-warn/10 px-4 text-sm font-medium text-warn disabled:opacity-60"
                onClick={() => deleteAccount.mutate()}
              >
                {deleteAccount.isPending ? "Deleting…" : "Yes, delete my account"}
              </button>
              <button
                type="button"
                disabled={deleteAccount.isPending}
                className="h-10 rounded-lg border border-line px-4 text-sm text-ink"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {deleteError ? (
          <p role="alert" className="mt-2 text-sm text-warn">
            {deleteError}
          </p>
        ) : null}
      </section>
    </Shell>
  );
}
