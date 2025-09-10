import excuteQuery from "@/lib/db";

async function ensureAssetFilesTable() {
  await excuteQuery({
    query: `CREATE TABLE IF NOT EXISTS asset_files (
      id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
      asset_id BIGINT(20) UNSIGNED NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(512) NOT NULL,
      uploaded_by_user_id BIGINT(20) UNSIGNED NULL,
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY asset_files_asset_id_idx (asset_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    values: [],
  });
}

export async function listAssetFiles(asset_id) {
  await ensureAssetFilesTable();
  return await excuteQuery({
    query: `SELECT * FROM asset_files WHERE asset_id = ? ORDER BY uploaded_at DESC`,
    values: [asset_id],
  });
}

export async function addAssetFile({ asset_id, file_name, file_path, uploaded_by_user_id = null }) {
  await ensureAssetFilesTable();
  const res = await excuteQuery({
    query: `INSERT INTO asset_files (asset_id, file_name, file_path, uploaded_by_user_id, uploaded_at) VALUES (?, ?, ?, ?, NOW())`,
    values: [asset_id, file_name, file_path, uploaded_by_user_id],
  });
  return res.insertId;
}

export async function deleteAssetFile(id) {
  await ensureAssetFilesTable();
  await excuteQuery({
    query: `DELETE FROM asset_files WHERE id = ?`,
    values: [id],
  });
}

