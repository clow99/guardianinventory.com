import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/productHelper";
import { getAuthContext, requireAccountMember } from "@/lib/apiAccess";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const account_id = Number(searchParams.get("account_id"));
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const auth = await getAuthContext();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    if (!account_id || !Number.isFinite(account_id)) {
      return NextResponse.json({ success: false, error: "Valid account_id is required" }, { status: 400 });
    }
    const gate = await requireAccountMember(account_id);
    if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

    let rows = await getAllProducts({ account_id });
    if (q) {
      const fields = ["product_name", "product_description", "category_name", "manufacturer_name", "supplier_name"];
      const norm = (v) => (typeof v === "string" ? v.toLowerCase() : "");
      rows = rows.filter((r) => fields.some((f) => norm(r[f]).includes(q)));
    }

    const cols = [
      ["product_id", "Product ID"],
      ["product_name", "Product Name"],
      ["category_name", "Category"],
      ["manufacturer_name", "Manufacturer"],
      ["supplier_name", "Supplier"],
      ["updated_at", "Updated"],
    ];
    const header = cols.map(([, h]) => h).join(",");
    const lines = rows.map((r) =>
      cols
        .map(([k]) => {
          const v = r[k];
          const s = v == null ? "" : String(v);
          return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(",")
    );
    const csv = [header, ...lines].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename=products_${account_id}.csv`,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.message || "Error exporting products." }, { status: 500 });
  }
}

