import excuteQuery from "@/lib/db";

export async function listEmployeeAssets(employee_id) {
    return await excuteQuery({
        query: `
            SELECT a.*
            FROM employee_assets ea
            INNER JOIN assets a ON ea.asset_id = a.asset_id
            WHERE ea.employee_id = ?
        `,
        values: [employee_id],
    });
}

export async function addEmployeeAsset(employee_id, asset_id, assigned_date = null) {
    await excuteQuery({
        query: `INSERT IGNORE INTO employee_assets (employee_id, asset_id, assigned_date) VALUES (?, ?, ?)` ,
        values: [employee_id, asset_id, assigned_date],
    });
}

export async function removeEmployeeAsset(employee_id, asset_id) {
    await excuteQuery({
        query: `DELETE FROM employee_assets WHERE employee_id = ? AND asset_id = ?`,
        values: [employee_id, asset_id],
    });
}

