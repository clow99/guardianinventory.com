"use client";

import { useEffect, useMemo, useState } from "react";
import MainBtn from "../buttons/MainBtn";
import { PlusIcon } from "lucide-react";
import AnimatedSwitch from "../inputs/AnimatedSwitch";
import { Tabs } from "../buttons/Tabs";
import Modal from "../modals/Modal";
import AnimatedInput from "../inputs/AnimatedInput";

// Original tab options
const tabOptions = [
    { label: "Products", key: "products" },
    { label: "Assets", key: "assets" },
    { label: "Categories", key: "categories" },
    { label: "Suppliers", key: "suppliers" },
    { label: "Manufacturers", key: "manufacturers" },
    { label: "Locations", key: "locations" },
    { label: "Employees", key: "employees" },
    { label: "Permissions", key: "permissions" },
    { label: "Users", key: "users" },
    { label: "Sites", key: "sites" },
    { label: "Groups", key: "groups" },
    { label: "Reports", key: "reports" },
    { label: "Account Settings", key: "settings" },
];

// Original default permissions per tab (UI only; values will be overridden from DB)
const defaultPermissions = {
    products: [
        {
            key: "view",
            label: "View Products",
            description:
                "Allows users to view product details and inventory levels.",
            value: false,
        },
        {
            key: "create",
            label: "Create Products",
            description:
                "Allows users to create new products and manage inventory.",
            value: false,
        },
        {
            key: "edit",
            label: "Edit Products",
            description:
                "Allows users to edit existing products and manage inventory.",
            value: false,
        },
    ],
    assets: [
        {
            key: "view",
            label: "View Assets",
            description: "Allows users to view asset details.",
            value: false,
        },
        {
            key: "assign",
            label: "Assign Assets",
            description:
                "Allows users to assign assets to employees or locations.",
            value: false,
        },
        {
            key: "move",
            label: "Move Assets",
            description:
                "Allows users to move assets between categories or sites.",
            value: false,
        },
    ],
    categories: [
        {
            key: "view",
            label: "View Categories",
            description: "Allows users to view categories.",
            value: false,
        },
        {
            key: "create",
            label: "Create Categories",
            description: "Allows users to create new categories.",
            value: false,
        },
        {
            key: "edit",
            label: "Edit Categories",
            description: "Allows users to edit existing categories.",
            value: false,
        },
    ],
    suppliers: [
        {
            key: "view",
            label: "View Suppliers",
            description: "Allows users to view supplier information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Suppliers",
            description: "Allows users to add, edit, or remove suppliers.",
            value: false,
        },
    ],
    manufacturers: [
        {
            key: "view",
            label: "View Manufacturers",
            description: "Allows users to view manufacturer information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Manufacturers",
            description: "Allows users to add, edit, or remove manufacturers.",
            value: false,
        },
    ],
    locations: [
        {
            key: "view",
            label: "View Locations",
            description: "Allows users to view locations.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Locations",
            description: "Allows users to add, edit, or remove locations.",
            value: false,
        },
    ],
    employees: [
        {
            key: "view",
            label: "View Employees",
            description: "Allows users to view employee information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Employees",
            description: "Allows users to add, edit, or remove employees.",
            value: false,
        },
    ],
    permissions: [
        {
            key: "view",
            label: "View Permissions",
            description: "Allows users to view permission settings.",
            value: false,
        },
        {
            key: "edit",
            label: "Edit Permissions",
            description:
                "Allows users to change permissions for roles or users.",
            value: false,
        },
    ],
    users: [
        {
            key: "view",
            label: "View Users",
            description: "Allows users to view user information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Users",
            description: "Allows users to add, edit, or remove users.",
            value: false,
        },
    ],
    sites: [
        {
            key: "view",
            label: "View Sites",
            description: "Allows users to view site information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Sites",
            description: "Allows users to add, edit, or remove sites.",
            value: false,
        },
    ],
    groups: [
        {
            key: "view",
            label: "View Groups",
            description: "Allows users to view group information.",
            value: false,
        },
        {
            key: "manage",
            label: "Manage Groups",
            description: "Allows users to add, edit, or remove groups.",
            value: false,
        },
    ],
    reports: [
        {
            key: "view",
            label: "View Reports",
            description: "Allows users to view system reports.",
            value: false,
        },
        {
            key: "export",
            label: "Export Reports",
            description: "Allows users to export or download reports.",
            value: false,
        },
    ],
    settings: [
        {
            key: "view",
            label: "View Account Settings",
            description: "Allows users to view account settings.",
            value: false,
        },
        {
            key: "edit",
            label: "Edit Account Settings",
            description: "Allows users to modify account settings.",
            value: false,
        },
    ],
};

export default function PermissionPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState("products");

    // Maintain UI permissions structure (restored)
    const [permUi, setPermUi] = useState(() =>
        Object.fromEntries(
            Object.entries(defaultPermissions).map(([tab, perms]) => [
                tab,
                perms.map((p) => ({ ...p })),
            ])
        )
    );

    // Functional wiring
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [nameToId, setNameToId] = useState({}); // permission_name -> permission_id
    const [assignedNames, setAssignedNames] = useState(new Set()); // permission_name set
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    // Create role modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDesc, setNewRoleDesc] = useState("");
    // Role picker modal
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [roleSearch, setRoleSearch] = useState("");
    const [pendingRoleId, setPendingRoleId] = useState("");
    // Filter modal
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [pendingFilter, setPendingFilter] = useState("");
    // Permission toggles will save inline (no modal)

    // Load roles and all permissions
    useEffect(() => {
        let abort = false;
        (async () => {
            try {
                const [rolesRes, permsRes] = await Promise.all([
                    fetch("/api/roles", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ activeOnly: true }),
                    }),
                    fetch("/api/permissions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ activeOnly: true }),
                    }),
                ]);
                const rolesJson = await rolesRes.json();
                const permsJson = await permsRes.json();
                if (abort) return;
                const rs = rolesJson?.data || [];
                const ps = permsJson?.data || [];
                const map = Object.fromEntries(
                    ps.map((p) => [
                        String(p.permission_name),
                        Number(p.permission_id),
                    ])
                );
                setRoles(rs);
                setNameToId(map);
                if (rs.length) setSelectedRoleId(String(rs[0].role_id));
            } catch (e) {
                if (!abort)
                    setError(e?.message || "Failed to load roles/permissions");
            }
        })();
        return () => {
            abort = true;
        };
    }, []);

    // Load selected role's assigned permissions and sync UI values
    useEffect(() => {
        if (!selectedRoleId) return;
        let abort = false;
        (async () => {
            try {
                const res = await fetch("/api/roles/byId", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role_id: Number(selectedRoleId) }),
                });
                const json = await res.json();
                const perms = json?.data?.permissions || [];
                const set = new Set(
                    perms.map((p) => String(p.permission_name))
                );
                if (abort) return;
                setAssignedNames(set);
                // Reflect into UI values
                setPermUi((prev) => {
                    const next = { ...prev };
                    for (const [tab, arr] of Object.entries(next)) {
                        next[tab] = arr.map((p) => ({
                            ...p,
                            value: set.has(`${tab}.${p.key}`),
                        }));
                    }
                    return next;
                });
            } catch (e) {
                if (!abort)
                    setError(e?.message || "Failed to load role permissions");
            }
        })();
        return () => {
            abort = true;
        };
    }, [selectedRoleId]);

    // Helper: ensure a permission exists in DB; return id
    const ensurePermissionId = async (name, description) => {
        let id = nameToId[name];
        if (id) return id;
        const res = await fetch("/api/permissions/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                permission_name: name,
                permission_description: description || null,
            }),
        });
        const json = await res.json();
        if (!res.ok || !json?.success)
            throw new Error(json?.error || "Failed to create permission");
        const created = json.data;
        setNameToId((m) => ({
            ...m,
            [created.permission_name]: Number(created.permission_id),
        }));
        return Number(created.permission_id);
    };

    const handlePermissionChange = async (tabKey, permKey, checked, meta) => {
        if (!selectedRoleId) return;
        const name = `${tabKey}.${permKey}`;
        try {
            setSaving(true);
            // Ensure permission exists
            const permission_id = await ensurePermissionId(name, meta?.label);
            // Persist toggle
            const endpoint = checked
                ? "/api/roles/permission/add"
                : "/api/roles/permission/delete";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role_id: Number(selectedRoleId),
                    permission_id,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || "Failed to update permission");
            // Update local assigned names
            setAssignedNames((prev) => {
                const next = new Set(prev);
                if (checked) next.add(name);
                else next.delete(name);
                return next;
            });
            // Reflect into UI
            setPermUi((prev) => ({
                ...prev,
                [tabKey]: prev[tabKey].map((p) =>
                    p.key === permKey ? { ...p, value: checked } : p
                ),
            }));
        } catch (e) {
            setError(e?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const tabLabels = useMemo(
        () =>
            Object.fromEntries(
                tabOptions.map(({ key, label }) => [key, label])
            ),
        []
    );

    const roleOptions = useMemo(
        () =>
            roles.map((r) => ({
                value: String(r.role_id),
                label: r.role_name,
            })),
        [roles]
    );

    return (
        <div className="flex flex-col">
            {/* Page header & controls (restored layout) */}
            <div className="flex flex-row w-full items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Permissions</h2>
                <div className="flex items-center justify-end gap-3">
                    <MainBtn
                        label="Create Role"
                        href="#"
                        icon={PlusIcon}
                        onClick={(e) => {
                            e?.preventDefault?.();
                            setNewRoleName("");
                            setNewRoleDesc("");
                            setIsCreateOpen(true);
                        }}
                    />
                    <button
                        className="bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-sm text-neutral-200 hover:border-orange-500"
                        onClick={() => {
                            setRoleSearch("");
                            setPendingRoleId(selectedRoleId);
                            setIsRoleModalOpen(true);
                        }}
                        type="button"
                    >
                        {roleOptions.find((o) => o.value === selectedRoleId)
                            ?.label || "Choose Role"}
                    </button>
                    <button
                        className="bg-neutral-800 border border-neutral-700 rounded px-4 py-2 text-sm text-neutral-200 hover:border-orange-500"
                        onClick={() => {
                            setPendingFilter(searchQuery);
                            setIsFilterOpen(true);
                        }}
                        type="button"
                    >
                        Filter
                    </button>
                </div>
            </div>
            {/* Tabbed menu (restored) */}
            <Tabs
                tabs={tabOptions}
                value={selectedTab}
                onChange={setSelectedTab}
            />

            {/* Tab content (restored visuals) */}
            <div>
                <div className="font-medium text-neutral-200 mb-1">
                    {tabLabels[selectedTab]} Permissions
                </div>
                <div className="text-neutral-400 text-sm mb-4">
                    Manage permissions for{" "}
                    {tabLabels[selectedTab].toLowerCase()}-related actions.
                </div>
            </div>
            {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                {permUi[selectedTab] &&
                    permUi[selectedTab].map((perm, index) => (
                        <div
                            className="grid grid-cols-3 py-3"
                            key={perm.key + index}
                        >
                            <div></div>
                            <div className="flex flex-col">
                                <AnimatedSwitch
                                    id={`${selectedTab}-${perm.key}-${index}`}
                                    label={perm.label}
                                    checked={!!perm.value}
                                    disabled={saving}
                                    onChange={(e) =>
                                        handlePermissionChange(
                                            selectedTab,
                                            perm.key,
                                            e.target.checked,
                                            { label: perm.label }
                                        )
                                    }
                                />
                                <div className="text-neutral-400 text-sm pl-18">
                                    {perm.description}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Create Role Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Create Role
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                    Add a role and then toggle permissions by tab.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <AnimatedInput
                        id="role-name"
                        label="Role name"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                    />
                    <AnimatedInput
                        id="role-desc"
                        label="Description (optional)"
                        value={newRoleDesc}
                        onChange={(e) => setNewRoleDesc(e.target.value)}
                    />
                </div>
                {error && (
                    <div className="text-red-400 text-sm mt-2">{error}</div>
                )}
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                        onClick={() => setIsCreateOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-orange-500/90 hover:bg-orange-500 text-white font-semibold disabled:opacity-60"
                        disabled={saving || !newRoleName.trim()}
                        onClick={async () => {
                            setSaving(true);
                            setError("");
                            try {
                                const res = await fetch("/api/roles/add", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        role_name: newRoleName.trim(),
                                        description: newRoleDesc.trim() || null,
                                    }),
                                });
                                const json = await res.json();
                                if (!res.ok || !json?.success)
                                    throw new Error(
                                        json?.error || "Failed to create role"
                                    );
                                const created = json.data;
                                setRoles((prev) => [...prev, created]);
                                setSelectedRoleId(String(created.role_id));
                                setIsCreateOpen(false);
                            } catch (e) {
                                setError(e?.message || "Failed to create role");
                            } finally {
                                setSaving(false);
                            }
                        }}
                    >
                        {saving ? "Creating…" : "Create role"}
                    </button>
                </div>
            </Modal>

            {/* Role Picker Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
            >
                <h3 className="text-lg font-semibold text-white mb-2">
                    Choose Role
                </h3>
                <AnimatedInput
                    id="role-search"
                    label="Search roles"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                />
                <div className="mt-2 max-h-64 overflow-auto divide-y divide-neutral-800 border border-neutral-800 rounded">
                    {roles
                        .filter((r) =>
                            (r.role_name || "")
                                .toLowerCase()
                                .includes(roleSearch.toLowerCase())
                        )
                        .map((r) => (
                            <button
                                key={r.role_id}
                                className={`w-full text-left px-3 py-2 hover:bg-neutral-800 ${
                                    String(r.role_id) === pendingRoleId
                                        ? "bg-neutral-800"
                                        : ""
                                }`}
                                onClick={() =>
                                    setPendingRoleId(String(r.role_id))
                                }
                            >
                                <div className="text-neutral-100">
                                    {r.role_name}
                                </div>
                                {r.description && (
                                    <div className="text-neutral-400 text-xs">
                                        {r.description}
                                    </div>
                                )}
                            </button>
                        ))}
                    {!roles.length && (
                        <div className="px-3 py-2 text-neutral-400 text-sm">
                            No roles found.
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                        onClick={() => setIsRoleModalOpen(false)}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-orange-500/90 hover:bg-orange-500 text-white"
                        onClick={() => {
                            if (pendingRoleId) setSelectedRoleId(pendingRoleId);
                            setIsRoleModalOpen(false);
                        }}
                    >
                        Select
                    </button>
                </div>
            </Modal>

            {/* Filter Modal */}
            <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Filter permissions
                </h3>
                <AnimatedInput
                    id="perm-filter"
                    label="Search"
                    value={pendingFilter}
                    onChange={(e) => setPendingFilter(e.target.value)}
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        className="px-4 py-2 rounded border border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                        onClick={() => setIsFilterOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-orange-500/90 hover:bg-orange-500 text-white"
                        onClick={() => {
                            setSearchQuery(pendingFilter);
                            setIsFilterOpen(false);
                        }}
                    >
                        Apply
                    </button>
                </div>
            </Modal>

            {/* Permission toggles save inline; no modal */}
        </div>
    );
}
