"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedInput from "@/components/inputs/AnimatedInput";

export default function TaskDetailDrawer({ taskId, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [task, setTask] = useState(null);
    const [assignees, setAssignees] = useState([]);
    const [files, setFiles] = useState([]);

    // Add assignee search
    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState([]);
    // Add file form
    const [fileName, setFileName] = useState("");
    const [filePath, setFilePath] = useState("");

    useEffect(() => {
        if (!taskId) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch("/api/tasks/byId", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ task_id: Number(taskId) }),
                });
                const json = await res.json();
                if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to load task");
                if (cancelled) return;
                setTask(json.data);
                setAssignees(json.data?.assignees || []);
                setFiles(json.data?.files || []);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [taskId]);

    useEffect(() => {
        let cancelled = false;
        if (!userQuery.trim()) {
            setUserResults([]);
            return;
        }
        (async () => {
            try {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ q: userQuery.trim(), limit: 10 }),
                });
                const json = await res.json();
                if (!cancelled && json?.success) setUserResults(json.data || []);
            } catch {}
        })();
        return () => {
            cancelled = true;
        };
    }, [userQuery]);

    async function addAssignee(user_id) {
        if (!taskId || !user_id) return;
        const res = await fetch("/api/tasks/assign/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: Number(taskId), user_id: Number(user_id) }),
        });
        const json = await res.json();
        if (res.ok && json?.success) {
            setAssignees(json.data || []);
            setUserQuery("");
            setUserResults([]);
        }
    }

    async function removeAssignee(user_id) {
        const res = await fetch("/api/tasks/assign/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: Number(taskId), user_id: Number(user_id) }),
        });
        const json = await res.json();
        if (res.ok && json?.success) setAssignees(json.data || []);
    }

    async function addFile() {
        if (!fileName.trim() || !filePath.trim()) return;
        const res = await fetch("/api/tasks/file/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: Number(taskId), file_name: fileName.trim(), file_path: filePath.trim() }),
        });
        const json = await res.json();
        if (res.ok && json?.success) {
            setFiles(json.data || []);
            setFileName("");
            setFilePath("");
        }
    }

    if (!taskId) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/50" onClick={onClose} />
            {/* Drawer */}
            <div className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-700 p-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-white text-xl font-semibold">Task Details</h2>
                    <button className="ml-auto text-neutral-400 hover:text-neutral-200" onClick={onClose}>
                        Close
                    </button>
                </div>
                {loading && <div className="text-neutral-400 text-sm">Loading...</div>}
                {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
                {task && (
                    <div className="space-y-4">
                        <div>
                            <div className="text-neutral-200 font-semibold">{task.title || "(untitled)"}</div>
                            {task.description && (
                                <div className="text-neutral-300 text-sm whitespace-pre-wrap mt-1">{task.description}</div>
                            )}
                            <div className="text-neutral-500 text-xs mt-2 space-y-1">
                                {task.status && <div>Status: {String(task.status).replace(/_/g, " ")}</div>}
                                {task.due_at && <div>Due: {new Date(task.due_at).toLocaleString()}</div>}
                                {task.completed_at && <div>Completed: {new Date(task.completed_at).toLocaleString()}</div>}
                            </div>
                        </div>

                        {/* Assignees */}
                        <div className="border border-neutral-700 rounded p-3">
                            <div className="text-white font-semibold mb-2">Assignees</div>
                            <div className="space-y-2">
                                {assignees.map((a) => (
                                    <div key={a.user_id} className="flex items-center gap-2">
                                        <div className="text-neutral-200">{a.full_name || a.email}</div>
                                        <button className="ml-auto text-xs text-red-400 hover:text-red-300" onClick={() => removeAssignee(a.user_id)}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {!assignees.length && (
                                    <div className="text-neutral-400 text-sm">No assignees.</div>
                                )}
                                <div className="pt-2">
                                    <AnimatedInput id="assignee-search" label="Add assignee (search users)" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
                                    {userResults.length > 0 && (
                                        <div className="mt-2 max-h-40 overflow-auto border border-neutral-800 rounded divide-y divide-neutral-800">
                                            {userResults.map((u) => (
                                                <button key={u.id} className="w-full text-left px-3 py-2 hover:bg-neutral-800" onClick={() => addAssignee(u.id)}>
                                                    <div className="text-neutral-100">{u.full_name || u.username || u.email}</div>
                                                    <div className="text-neutral-400 text-xs">{u.email}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Files */}
                        <div className="border border-neutral-700 rounded p-3">
                            <div className="text-white font-semibold mb-2">Files</div>
                            <div className="space-y-2">
                                {files.map((f) => (
                                    <div key={f.id} className="flex items-center gap-2">
                                        <a className="text-orange-400 hover:text-orange-300 truncate" href={f.file_path} target="_blank" rel="noreferrer">
                                            {f.file_name}
                                        </a>
                                        <div className="ml-auto text-neutral-500 text-xs">{new Date(f.uploaded_at).toLocaleString()}</div>
                                    </div>
                                ))}
                                {!files.length && (
                                    <div className="text-neutral-400 text-sm">No files attached.</div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                                    <AnimatedInput id="file-name" label="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                                    <AnimatedInput id="file-path" label="File URL / path" value={filePath} onChange={(e) => setFilePath(e.target.value)} />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button className={`rounded px-3 py-1.5 text-sm text-white ${fileName.trim() && filePath.trim() ? "bg-orange-500/80 hover:bg-orange-500" : "bg-neutral-700 text-neutral-400 cursor-not-allowed"}`} disabled={!fileName.trim() || !filePath.trim()} onClick={addFile}>
                                        Add file
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

