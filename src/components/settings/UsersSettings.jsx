"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";
import { useAccount } from "@/app/hooks/useAccount";

export default function UsersSettings() {
    const { accountId } = useAccount();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [roles, setRoles] = useState([]);
    const [members, setMembers] = useState([]);
    const [q, setQ] = useState("");
    const [users, setUsers] = useState([]);
    const [addRoleId, setAddRoleId] = useState("");

    const roleOptions = useMemo(
        () => roles.map((r) => ({ value: String(r.role_id), label: r.role_name })),
        [roles]
    );

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/roles", { method: "POST" });
                const json = await res.json();
                if (json?.success) setRoles(json.data || []);
            } catch {}
        })();
    }, []);

    useEffect(() => {
        if (!accountId) return;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/accounts/users/list", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ account_id: Number(accountId) }),
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load account users");
                setMembers(json.data || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [accountId]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ q, limit: 25 }),
                });
                const json = await res.json();
                if (!cancelled && json?.success) setUsers(json.data || []);
            } catch {}
        })();
        return () => {
            cancelled = true;
        };
    }, [q]);

    if (!accountId)
        return (
            <div className="text-neutral-300">
                Select an account from the left to manage users.
            </div>
        );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-neutral-700 rounded p-3">
                <div className="flex items-center mb-2">
                    <h2 className="text-white font-semibold">Account Members</h2>
                    {loading && (
                        <span className="ml-2 text-xs text-neutral-400">Loading...</span>
                    )}
                </div>
                {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
                <table className="w-full text-sm">
                    <thead className="text-neutral-400">
                        <tr>
                            <th className="text-left px-2 py-1">User</th>
                            <th className="text-left px-2 py-1">Role</th>
                            <th className="text-right px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => (
                            <tr key={`${m.account_id}:${m.user_id}`} className="border-t border-neutral-800">
                                <td className="px-2 py-2">
                                    <div className="text-neutral-100">{m.full_name || m.username || m.email}</div>
                                    <div className="text-neutral-400 text-xs">{m.email}</div>
                                </td>
                                <td className="px-2 py-2">
                                    <select
                                        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-200"
                                        value={String(m.role_id || "")}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            await fetch("/api/accounts/users/update", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    account_id: Number(accountId),
                                                    user_id: Number(m.user_id),
                                                    role_id: val ? Number(val) : null,
                                                }),
                                            });
                                            // update local state
                                            setMembers((prev) => prev.map((x) => (x.user_id === m.user_id ? { ...x, role_id: val ? Number(val) : null } : x)));
                                        }}
                                    >
                                        <option value="">None</option>
                                        {roleOptions.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-2 text-right">
                                    <button
                                        className="text-red-400 hover:text-red-300"
                                        onClick={async () => {
                                            await fetch("/api/accounts/users/delete", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    account_id: Number(accountId),
                                                    user_id: Number(m.user_id),
                                                }),
                                            });
                                            setMembers((prev) => prev.filter((x) => x.user_id !== m.user_id));
                                        }}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!members.length && (
                            <tr>
                                <td className="px-2 py-3 text-neutral-400" colSpan={3}>
                                    No members in this account yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="border border-neutral-700 rounded p-3">
                <h2 className="text-white font-semibold mb-2">Add Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <AnimatedInput id="user-search" label="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
                    <AnimatedSelect
                        id="role-select"
                        label="Assign role"
                        value={addRoleId}
                        onChange={(e) => setAddRoleId(e?.target?.value || "")}
                        options={[{ value: "", label: "None" }, ...roleOptions]}
                    />
                </div>
                <div className="max-h-80 overflow-auto border border-neutral-800 rounded">
                    {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
                            <div>
                                <div className="text-neutral-100">{u.full_name || u.username || u.email}</div>
                                <div className="text-neutral-400 text-xs">{u.email}</div>
                            </div>
                            <button
                                className="bg-orange-500/80 hover:bg-orange-500 text-white text-sm rounded px-3 py-1"
                                onClick={async () => {
                                    await fetch("/api/accounts/users/add", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            account_id: Number(accountId),
                                            user_id: Number(u.id),
                                            role_id: addRoleId ? Number(addRoleId) : null,
                                        }),
                                    });
                                    setMembers((prev) => {
                                        const exists = prev.some((m) => m.user_id === u.id);
                                        if (exists) return prev;
                                        return [
                                            ...prev,
                                            { account_id: Number(accountId), user_id: u.id, full_name: u.full_name, username: u.username, email: u.email, role_id: addRoleId ? Number(addRoleId) : null },
                                        ];
                                    });
                                }}
                            >
                                Add
                            </button>
                        </div>
                    ))}
                    {!users.length && (
                        <div className="px-3 py-2 text-neutral-400 text-sm">No users match.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

