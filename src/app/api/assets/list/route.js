import { NextResponse } from "next/server";
import excuteQuery from "@/lib/db";
import { getAuthContext, requireAccountMember } from "@/lib/apiAccess";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const account_id = Number(searchParams.get("account_id"));
        const site_id = searchParams.get("site_id");
        const location_id = searchParams.get("location_id");
        const status = searchParams.get("status");
        const q = (searchParams.get("q") || "").trim().toLowerCase();
        const limitParam = Number(searchParams.get("limit"));
        const offsetParam = Number(searchParams.get("offset"));
        const sortByParam = (searchParams.get("sortBy") || "").trim();
        const sortDirParam = (searchParams.get("sortDir") || "").trim().toUpperCase();

        const auth = await getAuthContext();
        if (!auth.ok)
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );

        if (!account_id || Number.isNaN(account_id)) {
            return NextResponse.json(
                { success: false, error: "Valid account_id is required" },
                { status: 400 }
            );
        }
        const gate = await requireAccountMember(account_id);
        if (!gate.ok)
            return NextResponse.json(
                { success: false, error: gate.error },
                { status: gate.status }
            );

        const whereParts = [
            "a.deleted_at IS NULL",
            "p.account_id = ?",
        ];
        const values = [account_id];
        if (site_id) {
            whereParts.push("a.site_id = ?");
            values.push(Number(site_id));
        }
        if (location_id) {
            whereParts.push("a.location_id = ?");
            values.push(Number(location_id));
        }
        if (status) {
            whereParts.push("a.status = ?");
            values.push(status);
        }
        if (q) {
            whereParts.push(
                "(LOWER(a.serial_number) LIKE ? OR LOWER(a.asset_tag) LIKE ? OR LOWER(p.product_name) LIKE ? OR LOWER(s.site_name) LIKE ? OR LOWER(l.location_name) LIKE ? OR LOWER(a.status) LIKE ?)"
            );
            const w = `%${q}%`;
            values.push(w, w, w, w, w, w);
        }
        const whereSql = `WHERE ${whereParts.join(" AND ")}`;

        const allowedSort = {
            serial_number: "a.serial_number",
            asset_tag: "a.asset_tag",
            status: "a.status",
            product_name: "p.product_name",
            site_name: "s.site_name",
            location_name: "l.location_name",
            updated_at: "a.updated_at",
            created_at: "a.created_at",
        };
        const sortCol = allowedSort[sortByParam] || "a.updated_at";
        const sortDir = sortDirParam === "ASC" ? "ASC" : "DESC";
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 500) : 0;
        const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

        const countRows = await excuteQuery({
            query: `
                SELECT COUNT(*) AS total
                FROM assets a
                LEFT JOIN sites s ON a.site_id = s.site_id
                LEFT JOIN locations l ON a.location_id = l.location_id
                LEFT JOIN products p ON a.product_id = p.product_id
                ${whereSql}
            `,
            values,
        });
        const total = Number(countRows?.[0]?.total || 0);

        const rows = await excuteQuery({
            query: `
                SELECT a.*, s.site_name, l.location_name, p.product_name
                FROM assets a
                LEFT JOIN sites s ON a.site_id = s.site_id
                LEFT JOIN locations l ON a.location_id = l.location_id
                LEFT JOIN products p ON a.product_id = p.product_id
                ${whereSql}
                ORDER BY ${sortCol} ${sortDir}
                ${limit ? "LIMIT ? OFFSET ?" : ""}
            `,
            values: limit ? [...values, limit, offset] : values,
        });

        return NextResponse.json({
            success: true,
            data: rows,
            meta: { total, limit: limit || null, offset, sortBy: sortByParam || "updated_at", sortDir, q },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error?.message || "Error fetching assets",
            },
            { status: 500 }
        );
    }
}
