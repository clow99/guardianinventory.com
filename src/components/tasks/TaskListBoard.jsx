"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@/app/hooks/useAccount";
import TaskDetailDrawer from "@/components/tasks/TaskDetailDrawer";
import AnimatedInput from "@/components/inputs/AnimatedInput";
import AnimatedSelect from "@/components/inputs/AnimatedSelect";

function StatusPill({ status }) {
    const colors = {
        pending: "bg-yellow-500/20 text-yellow-300",
        in_progress: "bg-blue-500/20 text-blue-300",
        completed: "bg-green-500/20 text-green-300",
        skipped: "bg-neutral-500/20 text-neutral-300",
        cancelled: "bg-red-500/20 text-red-300",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || "bg-neutral-600/30 text-neutral-300"}`}>
            {String(status || "").replace(/_/g, " ")}
        </span>
    );
}

export default function TaskListBoard({ defaultQuery = "" }) {
    const { accountId } = useAccount();
    const [me, setMe] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [q, setQ] = useState(defaultQuery);
    const [assignedOnly, setAssignedOnly] = useState(false);
    const [sites, setSites] = useState([]);
    const [siteId, setSiteId] = useState("");
    const [openTaskId, setOpenTaskId] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/auth/me");
                const json = await res.json();
                if (json?.ok) setMe(json.me);
            } catch {}
        })();
    }, []);

    // Load sites for selected account
    useEffect(() => {
        if (!accountId) {
            setSites([]);
            setSiteId("");
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ account_id: Number(accountId), activeOnly: true }),
                });
                const json = await res.json();
                if (cancelled) return;
                const opts = (json?.data || []).map((s) => ({ value: String(s.site_id), label: s.site_name || `Site #${s.site_id}` }));
                setSites(opts);
            } catch {}
        })();
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const body = {
                    ...(accountId ? { account_id: Number(accountId) } : {}),
                    ...(siteId ? { site_id: Number(siteId) } : {}),
                    ...(assignedOnly && me?.id ? { assigned_user_id: Number(me.id) } : {}),
                };
                const res = await fetch("/api/tasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load tasks");
                if (!cancelled) setTasks(json.data || []);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [assignedOnly, me?.id, accountId, siteId]);

    const filtered = useMemo(() => {
        const needle = (q || "").trim().toLowerCase();
        if (!needle) return tasks;
        return (tasks || []).filter((t) =>
            (t.title || "").toLowerCase().includes(needle) ||
            (t.description || "").toLowerCase().includes(needle)
        );
    }, [tasks, q]);

    const groups = useMemo(() => {
        const by = { pending: [], in_progress: [], completed: [], other: [] };
        for (const t of filtered) {
            const s = t.status || "";
            if (s === "pending") by.pending.push(t);
            else if (s === "in_progress") by.in_progress.push(t);
            else if (s === "completed") by.completed.push(t);
            else by.other.push(t);
        }
        return by;
    }, [filtered]);

    function TaskCard({ task }) {
        return (
            <button type="button" onClick={() => setOpenTaskId(task.id)} className="text-left w-full border border-neutral-700 rounded p-2 hover:border-neutral-600 transition">
                <div className="flex items-center gap-2">
                    <div className="text-neutral-100 font-medium truncate">{task.title || "(untitled)"}</div>
                    <div className="ml-auto">
                        <StatusPill status={task.status} />
                    </div>
                </div>
                {task.description && (
                    <div className="text-neutral-400 text-xs mt-1 line-clamp-2 whitespace-pre-wrap">
                        {task.description}
                    </div>
                )}
                <div className="text-neutral-500 text-xs mt-2 flex gap-3">
                    {task.due_at && (
                        <span title="Due">Due: {new Date(task.due_at).toLocaleString()}</span>
                    )}
                    {task.completed_at && (
                        <span title="Completed">Done: {new Date(task.completed_at).toLocaleString()}</span>
                    )}
                </div>
            </button>
        );
    }

    if (!accountId) {
        return (
            <div className="text-neutral-300">Select an account to view tasks.</div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-3">
                <AnimatedInput id="task-search" label="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} />
                <AnimatedSelect id="site" label="Site" value={siteId} onChange={(e) => setSiteId(e?.target?.value || "")} options={[{ value: "", label: "All sites" }, ...sites]} />
                <label className="ml-auto text-sm text-neutral-300 flex items-center gap-2">
                    <input type="checkbox" checked={assignedOnly} onChange={(e) => setAssignedOnly(e.target.checked)} />
                    Assigned to me
                </label>
                {loading && <span className="text-xs text-neutral-400">Loading...</span>}
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                        <div className="text-neutral-200 font-semibold">Pending</div>
                        <div className="text-neutral-400 text-xs">{groups.pending.length}</div>
                    </div>
                    <div className="space-y-2">
                        {groups.pending.map((t) => (
                            <TaskCard key={t.id} task={t} />
                        ))}
                        {!groups.pending.length && (
                            <div className="text-neutral-500 text-sm">No pending tasks.</div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500/70" />
                        <div className="text-neutral-200 font-semibold">In Progress</div>
                        <div className="text-neutral-400 text-xs">{groups.in_progress.length}</div>
                    </div>
                    <div className="space-y-2">
                        {groups.in_progress.map((t) => (
                            <TaskCard key={t.id} task={t} />
                        ))}
                        {!groups.in_progress.length && (
                            <div className="text-neutral-500 text-sm">No in-progress tasks.</div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500/70" />
                        <div className="text-neutral-200 font-semibold">Completed</div>
                        <div className="text-neutral-400 text-xs">{groups.completed.length}</div>
                    </div>
                    <div className="space-y-2">
                        {groups.completed.map((t) => (
                            <TaskCard key={t.id} task={t} />
                        ))}
                        {!groups.completed.length && (
                            <div className="text-neutral-500 text-sm">No completed tasks.</div>
                        )}
                    </div>
                </div>
            </div>

            {groups.other.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-neutral-500/70" />
                        <div className="text-neutral-200 font-semibold">Other</div>
                        <div className="text-neutral-400 text-xs">{groups.other.length}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {groups.other.map((t) => (
                            <TaskCard key={t.id} task={t} />
                        ))}
                    </div>
                </div>
            )}

            {openTaskId && (
                <TaskDetailDrawer taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
            )}
        </div>
    );
}
