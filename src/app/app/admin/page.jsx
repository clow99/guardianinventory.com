"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modals/Modal";

function randomCode(len = 10) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++)
        out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function formatTimestamp(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AdminAccountsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);
    const [sendingTo, setSendingTo] = useState("");
    const [sendEmail, setSendEmail] = useState("");
    const [sendCode, setSendCode] = useState("");
    const [lastSentCode, setLastSentCode] = useState("");
    const [copiedKey, setCopiedKey] = useState(""); // ephemeral copy feedback key
    const [recentCodes, setRecentCodes] = useState([]);
    const [codesLoading, setCodesLoading] = useState(false);
    // Accordion state/data per account row
    const [invitesOpen, setInvitesOpen] = useState({}); // { [account_id]: boolean }
    const [invitesLoading, setInvitesLoading] = useState({}); // { [account_id]: boolean }
    const [invitesByAccount, setInvitesByAccount] = useState({}); // { [account_id]: Array }

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const meRes = await fetch("/api/auth/me");
                const meJson = await meRes.json();
                if (!meRes.ok || !meJson?.ok)
                    throw new Error(meJson?.error || "Auth error");
                const is_admin = Number(meJson.me?.is_admin) === 1;
                if (!is_admin) throw new Error("Admin access required");
                if (!cancelled) setIsAdmin(true);
                const accRes = await fetch("/api/accounts/list");
                const accJson = await accRes.json();
                if (!accRes.ok || accJson.success === false)
                    throw new Error(
                        accJson?.error || "Failed to load accounts"
                    );
                if (!cancelled) setAccounts(accJson.data || []);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [router]);

    // Auto-load recent codes when opening the modal for a given account
    useEffect(() => {
        if (!sendingTo) {
            setRecentCodes([]);
            return;
        }
        loadRecentCodes(sendingTo);
    }, [sendingTo]);

    if (loading) return <div className="p-6 text-neutral-300">Loading…</div>;
    if (!isAdmin) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">Admin: Accounts</h1>
                <div className="text-red-400 mb-3">
                    {error || "Admin access required."}
                </div>
                <a
                    href="/auth/login"
                    className="inline-block rounded-lg bg-orange-500/90 hover:bg-orange-500 px-4 py-2 text-white"
                >
                    Sign in
                </a>
            </div>
        );
    }

    const createAccount = async (e) => {
        e.preventDefault();
        setError("");
        setCreating(true);
        try {
            const res = await fetch("/api/accounts/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_name: newName,
                    description: newDesc,
                }),
            });
            const data = await res.json();
            if (!res.ok || data?.success === false)
                throw new Error(data?.error || "Create failed");
            setNewName("");
            setNewDesc("");
            // refresh list
            const accRes = await fetch("/api/accounts/list");
            const accJson = await accRes.json();
            setAccounts(accJson.data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setCreating(false);
        }
    };

    const sendPersonalCode = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("/api/accounts/code/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_id: sendingTo,
                    email: sendEmail,
                    code: sendCode || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok || data?.ok === false)
                throw new Error(data?.error || "Unable to send code");
            // capture last sent code for quick copy/share
            if (data?.code) setLastSentCode(String(data.code));
            setSendEmail("");
            setSendCode("");
            // refresh recent list
            if (sendingTo) await loadRecentCodes(sendingTo);
            // also refresh per-row accordion if open
            if (sendingTo && invitesOpen[sendingTo])
                await loadRowCodes(sendingTo);
        } catch (e) {
            setError(e.message);
        }
    };

    const copyText = async (text, key = "") => {
        try {
            await navigator.clipboard.writeText(String(text));
            setCopiedKey(key || String(text));
            setTimeout(() => setCopiedKey(""), 1500);
        } catch {}
    };

    const joinLinkForCode = (code) => {
        try {
            const origin =
                typeof window !== "undefined" ? window.location.origin : "";
            return `${origin.replace(
                /\/$/,
                ""
            )}/auth/join-account?code=${encodeURIComponent(
                String(code || "")
            )}`;
        } catch {
            return `/auth/join-account?code=${encodeURIComponent(
                String(code || "")
            )}`;
        }
    };

    const loadRecentCodes = async (accountId) => {
        try {
            setCodesLoading(true);
            const res = await fetch(
                `/api/accounts/code/list?account_id=${accountId}`
            );
            const data = await res.json();
            if (res.ok && data?.ok) setRecentCodes(data.data || []);
        } catch (e) {
            // surface error in page
            setError(e?.message || "Failed to load codes");
        } finally {
            setCodesLoading(false);
        }
    };

    // Load codes for a specific row (accordion)
    const loadRowCodes = async (accountId) => {
        try {
            setInvitesLoading((p) => ({ ...p, [accountId]: true }));
            const res = await fetch(
                `/api/accounts/code/list?account_id=${accountId}`
            );
            const data = await res.json();
            if (res.ok && data?.ok)
                setInvitesByAccount((p) => ({
                    ...p,
                    [accountId]: data.data || [],
                }));
        } catch (e) {
            setError(e?.message || "Failed to load invites");
        } finally {
            setInvitesLoading((p) => ({ ...p, [accountId]: false }));
        }
    };

    const toggleInvites = async (accountId) => {
        setInvitesOpen((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
        // If opening and nothing loaded yet, fetch
        if (!invitesOpen[accountId]) await loadRowCodes(accountId);
    };

    const revokeCode = async (id, accountId) => {
        try {
            await fetch(`/api/accounts/code/revoke`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            // refresh lists
            if (accountId) await loadRowCodes(accountId);
            if (sendingTo) await loadRecentCodes(sendingTo);
        } catch (e) {
            setError(e?.message || "Failed to revoke");
        }
    };

    const resendCode = async (id) => {
        try {
            await fetch(`/api/accounts/code/resend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
        } catch (e) {
            setError(e?.message || "Failed to resend");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Admin: Accounts</h1>
                <p className="text-neutral-400">
                    Create accounts and share invite codes.
                </p>
            </div>
            {error && <div className="text-red-400">{error}</div>}

            <form
                onSubmit={createAccount}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
            >
                <div>
                    <label className="block text-sm text-neutral-300 mb-1">
                        Account name
                    </label>
                    <input
                        className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-neutral-300 mb-1">
                        Description (optional)
                    </label>
                    <input
                        className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        disabled={creating}
                        className="w-full rounded-lg bg-orange-500/90 hover:bg-orange-500 px-4 py-2 font-semibold disabled:opacity-60"
                    >
                        {creating ? "Creating…" : "Create account"}
                    </button>
                </div>
            </form>

            <div className="border border-neutral-700 rounded-lg overflow-hidden">
                <div className="p-3 bg-neutral-900 border-b border-neutral-700 flex items-center gap-3">
                    <input
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Filter by name, ID, or description"
                        className="w-full md:w-96 rounded bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm"
                    />
                </div>
                <table className="w-full text-left text-neutral-200">
                    <thead className="bg-neutral-800">
                        <tr>
                            <th className="px-3 py-2 border-b border-neutral-700">
                                ID
                            </th>
                            <th className="px-3 py-2 border-b border-neutral-700">
                                Name
                            </th>
                            <th className="px-3 py-2 border-b border-neutral-700">
                                Description
                            </th>
                            <th className="px-3 py-2 border-b border-neutral-700">
                                Created
                            </th>
                            <th className="px-3 py-2 border-b border-neutral-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts
                            .filter((a) => {
                                const q = filter.trim().toLowerCase();
                                if (!q) return true;
                                return (
                                    String(a.account_id).includes(q) ||
                                    (a.account_name || "")
                                        .toLowerCase()
                                        .includes(q) ||
                                    (a.description || "")
                                        .toLowerCase()
                                        .includes(q)
                                );
                            })
                            .map((a) => (
                                <Fragment key={a.account_id}>
                                    <tr className="odd:bg-neutral-900">
                                        <td className="px-3 py-2 border-b border-neutral-800">
                                            {a.account_id}
                                        </td>
                                        <td className="px-3 py-2 border-b border-neutral-800">
                                            {a.account_name}
                                        </td>
                                        <td className="px-3 py-2 border-b border-neutral-800">
                                            {a.description || ""}
                                        </td>
                                        <td className="px-3 py-2 border-b border-neutral-800">
                                            {formatTimestamp(a.created_at)}
                                        </td>
                                        <td className="px-3 py-2 border-b border-neutral-800 space-x-2">
                                            <button
                                                className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white"
                                                onClick={() =>
                                                    toggleInvites(a.account_id)
                                                }
                                            >
                                                {invitesOpen[a.account_id]
                                                    ? "Hide invites"
                                                    : "View invites"}
                                            </button>
                                            <button
                                                className="text-xs px-2 py-1 rounded bg-orange-500/90 hover:bg-orange-500 text-white"
                                                onClick={() =>
                                                    setSendingTo(a.account_id)
                                                }
                                            >
                                                Send personal code
                                            </button>
                                            <button
                                                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white"
                                                onClick={() =>
                                                    copyText(
                                                        String(a.account_id),
                                                        `acct:${a.account_id}`
                                                    )
                                                }
                                            >
                                                {copiedKey ===
                                                `acct:${a.account_id}`
                                                    ? "Copied"
                                                    : "Copy ID"}
                                            </button>
                                        </td>
                                    </tr>
                                    {invitesOpen[a.account_id] && (
                                        <tr>
                                            <td
                                                className="px-3 py-2 border-b border-neutral-800 bg-neutral-950"
                                                colSpan={5}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-neutral-300 font-medium">
                                                        Recent codes
                                                    </div>
                                                    <div className="space-x-2">
                                                        <button
                                                            className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                            onClick={() =>
                                                                loadRowCodes(
                                                                    a.account_id
                                                                )
                                                            }
                                                        >
                                                            Refresh
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="max-h-64 overflow-auto border border-neutral-800 rounded">
                                                    {invitesLoading[
                                                        a.account_id
                                                    ] ? (
                                                        <div className="text-neutral-500 text-sm p-3">
                                                            Loading…
                                                        </div>
                                                    ) : (invitesByAccount[
                                                          a.account_id
                                                      ]?.length ?? 0) > 0 ? (
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-neutral-800 text-neutral-300">
                                                                <tr>
                                                                    <th className="px-2 py-1 text-left">
                                                                        Email
                                                                    </th>
                                                                    <th className="px-2 py-1 text-left">
                                                                        Code
                                                                    </th>
                                                                    <th className="px-2 py-1 text-left">
                                                                        Created
                                                                    </th>
                                                                    <th className="px-2 py-1 text-left">
                                                                        Status
                                                                    </th>
                                                                    <th className="px-2 py-1 text-left">
                                                                        Actions
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {invitesByAccount[
                                                                    a.account_id
                                                                ]?.map((c) => (
                                                                    <tr
                                                                        key={
                                                                            c.id
                                                                        }
                                                                        className="odd:bg-neutral-900"
                                                                    >
                                                                        <td className="px-2 py-1">
                                                                            {
                                                                                c.email
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-1 font-mono">
                                                                            {
                                                                                c.code
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            {formatTimestamp(
                                                                                c.created_at
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            {c.used_at ? (
                                                                                <span
                                                                                    className="text-green-400"
                                                                                    title={formatTimestamp(
                                                                                        c.used_at
                                                                                    )}
                                                                                >
                                                                                    Used
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-yellow-300">
                                                                                    Pending
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-1">
                                                                            <div className="flex gap-2 flex-wrap">
                                                                                <button
                                                                                    className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                                                    onClick={() =>
                                                                                        copyText(
                                                                                            c.code,
                                                                                            `code:${c.id}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {copiedKey ===
                                                                                    `code:${c.id}`
                                                                                        ? "Copied"
                                                                                        : "Copy code"}
                                                                                </button>
                                                                                <button
                                                                                    className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                                                    onClick={() =>
                                                                                        copyText(
                                                                                            joinLinkForCode(
                                                                                                c.code
                                                                                            ),
                                                                                            `link:${c.id}`
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {copiedKey ===
                                                                                    `link:${c.id}`
                                                                                        ? "Copied"
                                                                                        : "Copy link"}
                                                                                </button>
                                                                                {!c.used_at && (
                                                                                    <>
                                                                                        <button
                                                                                            className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                                                            onClick={() =>
                                                                                                resendCode(
                                                                                                    c.id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Resend
                                                                                        </button>
                                                                                        <button
                                                                                            className="text-xs rounded bg-red-600/80 hover:bg-red-600 px-2 py-1"
                                                                                            onClick={() =>
                                                                                                revokeCode(
                                                                                                    c.id,
                                                                                                    a.account_id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Revoke
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="text-neutral-500 text-sm p-3">
                                                            No codes yet for
                                                            this account.
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!sendingTo} onClose={() => setSendingTo("")}>
                <form onSubmit={sendPersonalCode} className="space-y-4">
                    <div className="text-neutral-100 text-lg font-semibold">
                        Send personal invite code
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="block text-sm text-neutral-300 mb-1">
                                Email
                            </label>
                            <input
                                className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
                                value={sendEmail}
                                onChange={(e) => setSendEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-300 mb-1">
                                Custom code (optional)
                            </label>
                            <input
                                className="w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2 font-mono"
                                value={sendCode}
                                onChange={(e) => setSendCode(e.target.value)}
                                placeholder="Auto-generate if empty"
                            />
                        </div>
                        <div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg bg-neutral-700 hover:bg-neutral-600 px-3 py-2 text-sm"
                                    onClick={() => setSendCode(randomCode())}
                                >
                                    Generate
                                </button>
                                <button className="flex-1 rounded-lg bg-orange-500/90 hover:bg-orange-500 px-4 py-2 font-semibold">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-neutral-400">
                        The recipient will receive an email with the code and a
                        link to join.
                    </div>

                    {lastSentCode && (
                        <div className="rounded border border-neutral-700 bg-neutral-900 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-neutral-300">
                                        Last sent code
                                    </div>
                                    <div className="font-mono text-neutral-100">
                                        {lastSentCode}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                        onClick={() =>
                                            copyText(lastSentCode, "last:code")
                                        }
                                    >
                                        {copiedKey === "last:code"
                                            ? "Copied"
                                            : "Copy code"}
                                    </button>
                                    <button
                                        type="button"
                                        className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                        onClick={() =>
                                            copyText(
                                                joinLinkForCode(lastSentCode),
                                                "last:link"
                                            )
                                        }
                                    >
                                        {copiedKey === "last:link"
                                            ? "Copied"
                                            : "Copy link"}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-neutral-400">
                                Share the link:{" "}
                                <span className="break-all">
                                    {joinLinkForCode(lastSentCode)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <div className="text-neutral-300 font-medium mb-2 flex items-center justify-between">
                            <span>Recent codes</span>
                            {sendingTo && (
                                <button
                                    type="button"
                                    className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                    onClick={() => loadRecentCodes(sendingTo)}
                                >
                                    Refresh
                                </button>
                            )}
                        </div>
                        <div className="max-h-64 overflow-auto border border-neutral-800 rounded">
                            {codesLoading ? (
                                <div className="text-neutral-500 text-sm p-3">
                                    Loading…
                                </div>
                            ) : recentCodes?.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-800 text-neutral-300">
                                        <tr>
                                            <th className="px-2 py-1 text-left">
                                                Email
                                            </th>
                                            <th className="px-2 py-1 text-left">
                                                Code
                                            </th>
                                            <th className="px-2 py-1 text-left">
                                                Created
                                            </th>
                                            <th className="px-2 py-1 text-left">
                                                Status
                                            </th>
                                            <th className="px-2 py-1 text-left">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentCodes.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="odd:bg-neutral-900"
                                            >
                                                <td className="px-2 py-1">
                                                    {c.email}
                                                </td>
                                                <td className="px-2 py-1 font-mono">
                                                    {c.code}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {formatTimestamp(
                                                        c.created_at
                                                    )}
                                                </td>
                                                <td className="px-2 py-1">
                                                    {c.used_at ? (
                                                        <span
                                                            className="text-green-400"
                                                            title={formatTimestamp(
                                                                c.used_at
                                                            )}
                                                        >
                                                            Used
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-300">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                            onClick={() =>
                                                                copyText(
                                                                    c.code,
                                                                    `modal:code:${c.id}`
                                                                )
                                                            }
                                                        >
                                                            {copiedKey ===
                                                            `modal:code:${c.id}`
                                                                ? "Copied"
                                                                : "Copy code"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="text-xs rounded bg-neutral-800 hover:bg-neutral-700 px-2 py-1"
                                                            onClick={() =>
                                                                copyText(
                                                                    joinLinkForCode(
                                                                        c.code
                                                                    ),
                                                                    `modal:link:${c.id}`
                                                                )
                                                            }
                                                        >
                                                            {copiedKey ===
                                                            `modal:link:${c.id}`
                                                                ? "Copied"
                                                                : "Copy link"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-neutral-500 text-sm p-3">
                                    No codes yet for this account.
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
