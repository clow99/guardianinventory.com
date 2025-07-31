"use client";

import { useState } from "react";
import SearchBar from "../inputs/SearchInput";
import MainBtn from "../buttons/MainBtn";
import { PlusIcon } from "lucide-react";
import AnimatedSelect from "../inputs/AnimatedSelect";
import AnimatedSwitch from "../inputs/AnimatedSwitch";
import { Tabs } from "../buttons/Tabs";

// Define all tab options
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

// Define permissions for each tab with default values
const defaultPermissions = {
    products: [
        {
            key: "view",
            label: "View Products",
            description:
                "Allows users to view product details and inventory levels.",
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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
            value: true,
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

    // State to manage permission toggles per tab
    const [permissions, setPermissions] = useState(() => {
        // Deep copy for state isolation
        return Object.fromEntries(
            Object.entries(defaultPermissions).map(([tab, perms]) => [
                tab,
                perms.map((p) => ({ ...p })),
            ])
        );
    });

    // Handle switch change for a specific tab and permission key
    const handlePermissionChange = (tabKey, permKey, checked) => {
        setPermissions((prev) => ({
            ...prev,
            [tabKey]: prev[tabKey].map((perm) =>
                perm.key === permKey ? { ...perm, value: checked } : perm
            ),
        }));
    };

    // Nice label for each tab
    const tabLabels = Object.fromEntries(
        tabOptions.map(({ key, label }) => [key, label])
    );

    return (
        <div className="flex flex-col">
            {/* Page header & controls */}
            <div className="flex flex-row w-full items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Permissions</h2>
                <div className="flex items-center justify-end gap-3">
                    <MainBtn
                        label="Create Role"
                        href="/permissions/add"
                        icon={PlusIcon}
                    />
                    <AnimatedSelect
                        options={[
                            { value: "view", label: "View" },
                            { value: "edit", label: "Edit" },
                            { value: "delete", label: "Delete" },
                        ]}
                        onChange={() => {}}
                        className="shrink-0"
                    />
                    <div className="w-64 shrink-0">
                        <SearchBar
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {/* Tabbed menu */}
            <Tabs
                tabs={tabOptions}
                value={selectedTab}
                onChange={setSelectedTab}
            />

            {/* Tab content for permissions */}
            <div>
                <div className="font-medium text-neutral-200 mb-1">
                    {tabLabels[selectedTab]} Permissions
                </div>
                <div className="text-neutral-400 text-sm mb-4">
                    Manage permissions for{" "}
                    {tabLabels[selectedTab].toLowerCase()}-related actions.
                </div>
            </div>
            <div className="flex flex-col border-b border-neutral-700 pb-10">
                {permissions[selectedTab] &&
                    permissions[selectedTab].map((perm, index) => (
                        <div
                            className="grid grid-cols-3 py-3"
                            key={perm.key + index}
                        >
                            <div></div>
                            <div className="flex flex-col">
                                <AnimatedSwitch
                                    id={`${selectedTab}-${perm.key}-${index}`}
                                    label={perm.label}
                                    checked={perm.value}
                                    onChange={(e) =>
                                        handlePermissionChange(
                                            selectedTab,
                                            perm.key,
                                            e.target.checked
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
        </div>
    );
}
