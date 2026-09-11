import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAllUsers } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listAllUsers() });
  const rows = users.data ?? [];

  return (
    <>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-muted">Everyone who has signed up.</p>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-bg text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Receipts</th>
              <th className="px-4 py-3">Messages</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 tabular-nums">{u.receipt_count}</td>
                <td className="px-4 py-3 tabular-nums">{u.message_count}</td>
                <td className="px-4 py-3 text-faint">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.isLoading && rows.length === 0 ? <p className="p-4 text-sm text-faint">No users yet.</p> : null}
      </div>
    </>
  );
}
