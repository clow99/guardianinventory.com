import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";

function parseDate(d) {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt) ? null : dt;
}

function firstOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    return d;
}

function monthKey(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${y}-${m}`;
}

function monthLabel(date) {
    return date.toLocaleString("en-US", { month: "short" });
}

const COLORS = [
    "#f97316", // orange
    "#2563eb", // blue
    "#64748b", // slate
    "#a3a3a3", // neutral
    "#22c55e", // green
    "#fbbf24", // amber
    "#8b5cf6", // violet
    "#e11d48", // rose
];
const ICONS = ["🛋️", "🧸", "🗄️", "🛏️", "🍽️", "💡", "🌳", "📦"];

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const account_id = Number(body.account_id) || null;
        const site_id = Number(body.site_id) || null;
        const startRaw = parseDate(body.start);
        const endRaw = parseDate(body.end);

        // Default: last 6 full months up to today
        const now = new Date();
        const defaultEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999
        );
        const defaultStart = addMonths(firstOfMonth(now), -5); // include current month + previous 5

        const start = startRaw ? firstOfMonth(startRaw) : defaultStart;
        const end = endRaw ? new Date(endRaw) : defaultEnd;

        if (!account_id) {
            return NextResponse.json(
                { success: false, error: "account_id required" },
                { status: 400 }
            );
        }

        const whereCore = [
            "p.account_id = ?",
            "a.deleted_at IS NULL",
            "p.deleted_at IS NULL",
        ];
        const valuesCore = [account_id];
        if (site_id) {
            whereCore.push("(a.site_id = ? OR p.site_id = ?)");
            valuesCore.push(site_id, site_id);
        }
        if (start) {
            whereCore.push("a.created_at >= ?");
            valuesCore.push(start);
        }
        if (end) {
            whereCore.push("a.created_at <= ?");
            valuesCore.push(end);
        }
        const whereSql = `WHERE ${whereCore.join(" AND ")}`;

        // 1) Distribution by category (donut)
        const donutRows = await excuteQuery({
            query: `
                SELECT COALESCE(c.category_name, 'Uncategorized') AS name,
                       COUNT(*) AS value
                FROM assets a
                JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                LEFT JOIN categories c ON p.category_id = c.category_id AND c.deleted_at IS NULL
                ${whereSql}
                GROUP BY c.category_id, name
                ORDER BY value DESC
                LIMIT 10
            `,
            values: valuesCore,
        });
        const donut = donutRows.map((r, idx) => ({
            name: r.name,
            value: Number(r.value) || 0,
            color: COLORS[idx % COLORS.length],
            icon: ICONS[idx % ICONS.length],
        }));

        // Helper: months list between start..end
        const months = [];
        let cursor = firstOfMonth(start);
        while (cursor <= end) {
            months.push(new Date(cursor));
            cursor = addMonths(cursor, 1);
        }

        // 2) Timeseries by month per top 4 categories (line)
        const tsRows = await excuteQuery({
            query: `
                SELECT DATE_FORMAT(a.created_at, '%Y-%m') AS ym,
                       COALESCE(c.category_name, 'Uncategorized') AS category,
                       COUNT(*) AS cnt
                FROM assets a
                JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                LEFT JOIN categories c ON p.category_id = c.category_id AND c.deleted_at IS NULL
                ${whereSql}
                GROUP BY ym, category
                ORDER BY ym ASC
            `,
            values: valuesCore,
        });
        const totalsByCat = new Map();
        tsRows.forEach((r) => {
            totalsByCat.set(
                r.category,
                (totalsByCat.get(r.category) || 0) + Number(r.cnt)
            );
        });
        const topCats = Array.from(totalsByCat.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map((x) => x[0]);

        const monthMap = new Map(); // ym -> { month: 'Jan', CatA: 3, CatB: 2 }
        months.forEach((m) => {
            const key = monthKey(m);
            monthMap.set(key, { month: monthLabel(m) });
        });
        tsRows.forEach((r) => {
            if (!topCats.includes(r.category)) return;
            const row = monthMap.get(r.ym);
            if (row) row[r.category] = (row[r.category] || 0) + Number(r.cnt);
        });
        const lineSeries = topCats.map((name, idx) => ({
            key: name,
            color: COLORS[idx % COLORS.length],
            icon: ICONS[idx % ICONS.length],
        }));
        const lineData = Array.from(monthMap.values());

        // 3) Double bar: per month assets created vs tasks created vs tasks completed
        const barsRows = await excuteQuery({
            query: `
                SELECT ym, 
                       SUM(assets_cnt) AS assets_cnt,
                       SUM(tasks_created) AS tasks_created,
                       SUM(tasks_completed) AS tasks_completed
                FROM (
                    SELECT DATE_FORMAT(a.created_at, '%Y-%m') AS ym, COUNT(*) AS assets_cnt, 0 AS tasks_created, 0 AS tasks_completed
                    FROM assets a
                    JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                    ${whereSql}
                    GROUP BY ym
                    UNION ALL
                    SELECT DATE_FORMAT(t.created_at, '%Y-%m') AS ym, 0, COUNT(*) AS tasks_created, 0
                    FROM asset_tasks t
                    JOIN assets a ON t.asset_id = a.asset_id AND a.deleted_at IS NULL
                    JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                    ${whereSql.replace(/a\.created_at/g, "t.created_at")}
                    GROUP BY ym
                    UNION ALL
                    SELECT DATE_FORMAT(t.completed_at, '%Y-%m') AS ym, 0, 0, COUNT(*) AS tasks_completed
                    FROM asset_tasks t
                    JOIN assets a ON t.asset_id = a.asset_id AND a.deleted_at IS NULL
                    JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                    ${whereSql.replace(/a\.created_at/g, "t.completed_at")}
                    AND t.completed_at IS NOT NULL
                    GROUP BY ym
                ) x
                GROUP BY ym
                ORDER BY ym ASC
            `,
            values: valuesCore,
        });
        const barsMap = new Map();
        months.forEach((m) => {
            const key = monthKey(m);
            barsMap.set(key, {
                name: monthLabel(m),
                seriesA: 0,
                seriesB: 0,
                seriesC: 0,
            });
        });
        barsRows.forEach((r) => {
            const row = barsMap.get(r.ym);
            if (row) {
                row.seriesA = Number(r.assets_cnt) || 0;
                row.seriesB = Number(r.tasks_created) || 0;
                row.seriesC = Number(r.tasks_completed) || 0;
            }
        });
        const bars = Array.from(barsMap.values());

        // 4) Day of week: tasks created count by weekday (Mon..Sun)
        const dowRows = await excuteQuery({
            query: `
                SELECT WEEKDAY(t.created_at) AS wday, COUNT(*) AS cnt
                FROM asset_tasks t
                JOIN assets a ON t.asset_id = a.asset_id AND a.deleted_at IS NULL
                JOIN products p ON a.product_id = p.product_id AND p.deleted_at IS NULL
                ${whereSql.replace(/a\.created_at/g, "t.created_at")}
                GROUP BY wday
                ORDER BY wday ASC
            `,
            values: valuesCore,
        });
        const dowNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dowIcons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗"];
        const dowInit = dowNames.map((d, i) => ({
            day: d,
            value: 0,
            icon: dowIcons[i],
        }));
        dowRows.forEach((r) => {
            const idx = Number(r.wday);
            if (idx >= 0 && idx < 7) dowInit[idx].value = Number(r.cnt) || 0;
        });

        return NextResponse.json({
            success: true,
            data: {
                donut,
                line: { data: lineData, series: lineSeries },
                dow: dowInit,
                bars,
                range: { start, end },
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error building charts",
            },
            { status: 500 }
        );
    }
}
