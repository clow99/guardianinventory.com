/* Auth guard tests via running Next dev and hitting HTTP endpoints.
   Uses TEST_AUTH to stub auth context in apiAccess.js without DB/next-auth. */

import { spawn } from "node:child_process";

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.TEST_AUTH = "1";

const PORT = process.env.PORT || 5056; // Separate port from smoke
const BASE = `http://127.0.0.1:${PORT}`;

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

async function waitUntilUp(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/ping`);
      if (res.ok) return true;
    } catch {}
    await wait(200);
  }
  return false;
}

async function withServer(env, fn) {
  const isWin = process.platform === "win32";
  const cmd = isWin ? "npx.cmd" : "npx";
  const args = ["next", "dev", "-p", String(PORT)];
  const child = spawn(cmd, args, { stdio: "pipe", env: { ...process.env, ...env }, shell: isWin });
  child.stdout.on("data", (d) => process.stdout.write(d.toString()));
  child.stderr.on("data", (d) => process.stderr.write(d.toString()));

  const up = await waitUntilUp();
  if (!up) {
    console.error("Server failed to start within timeout");
    child.kill();
    process.exit(1);
  }
  try {
    return await fn(child);
  } finally {
    child.kill();
    await wait(300);
  }
}

async function testNonAdminForbidden() {
  return await withServer({ TEST_IS_ADMIN: "0", TEST_USER_ID: "123", TEST_ACCOUNT_ID: "456" }, async () => {
    const cases = [
      ["POST", "/api/locations/add", {}],
      ["POST", "/api/accounts/users/add", { account_id: 1, user_id: 2 }],
      ["POST", "/api/products/categories/add", { product_id: 1, category_id: 2 }],
      ["POST", "/api/employees/assets/add", { employee_id: 1, asset_id: 2 }],
      ["POST", "/api/users", {}],
      ["POST", "/api/audit/logs", {}],
      ["POST", "/api/employees", {}],
    ];
    let fails = 0;
    for (const [method, path, body] of cases) {
      const { status } = await fetchJson(`${BASE}${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const ok = status === 403;
      console.log(`${ok ? "PASS" : "FAIL"} non-admin forbidden: ${path} -> ${status}`);
      if (!ok) fails++;
    }
    return fails;
  });
}

async function testAdminAllowed() {
  return await withServer({ TEST_IS_ADMIN: "1", TEST_USER_ID: "1", TEST_ACCOUNT_ID: "1" }, async () => {
    const cases = [
      ["POST", "/api/locations/add", {}],
      ["POST", "/api/accounts/users/add", {}],
    ];
    let fails = 0;
    for (const [method, path, body] of cases) {
      const { status } = await fetchJson(`${BASE}${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const ok = status !== 403 && status !== 401;
      console.log(`${ok ? "PASS" : "FAIL"} admin allowed past guard: ${path} -> ${status}`);
      if (!ok) fails++;
    }
    return fails;
  });
}

(async () => {
  let failCount = 0;
  failCount += await testNonAdminForbidden();
  failCount += await testAdminAllowed();
  if (failCount > 0) {
    console.error(`\n${failCount} test(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll auth guard tests passed.");
  }
})();
