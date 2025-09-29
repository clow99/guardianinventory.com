from pathlib import Path
path = Path('scripts/seed.mjs')
text = path.read_text()
if 'async function getColumnSet' not in text:
    marker = 'async function ensureSeedAdmin()'
    idx = text.index(marker)
    helper = "async function getColumnSet(table) {\r\n    try {\r\n        if (!/^[a-zA-Z0-9_]+$/.test(table)) return new Set();\r\n        const rows = await q(`SHOW COLUMNS FROM ${table}`);\r\n        return new Set((rows || []).map((r) => r.Field));\r\n    } catch (err) {\r\n        console.warn(`[seed] Unable to inspect columns for ${table}:`, err?.message || err);\r\n        return new Set();\r\n    }\r\n}\r\n\r\n"
    text = text[:idx] + helper + text[idx:]
    path.write_text(text)
