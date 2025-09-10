// Canonical notification type names used across the app and in preferences
export const NOTIFICATION_TYPES = [
  "low_inventory",
  "task_assigned",
  "weekly_summary",
  // add more canonical types here as you introduce them
];

const ALIASES = {
  lowinventory: "low_inventory",
  "low-inventory": "low_inventory",
  LowInventory: "low_inventory",
  taskassigned: "task_assigned",
  "task-assigned": "task_assigned",
  TaskAssigned: "task_assigned",
  weeklysummary: "weekly_summary",
  "weekly-summary": "weekly_summary",
  WeeklySummary: "weekly_summary",
};

export function canonicalizeNotificationType(type) {
  if (!type) return "";
  // direct alias match first
  if (ALIASES[type]) return ALIASES[type];
  const s = String(type)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // camelCase -> snake
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_") // non-alnum -> underscore
    .replace(/^_+|_+$/g, "") // trim underscores
    .replace(/__+/g, "_"); // collapse
  if (ALIASES[s]) return ALIASES[s];
  return s;
}

export function isKnownNotificationType(type) {
  return NOTIFICATION_TYPES.includes(type);
}

