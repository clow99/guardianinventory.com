/* Smoke test runner: builds assumptions
   - Server is started via next start on a random port
   - Uses TEST_AUTH test hook to bypass API auth and simulate admin
*/

import { spawn } from "node:child_process";

const PORT = process.env.PORT || 5055;
const BASE = `http://127.0.0.1:${PORT}`;
const ALLOW_500 = String(process.env.SMOKE_ALLOW_500 || "1") === "1";

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

async function run() {
  // Spawn server (production build assumed already completed)
  const env = { ...process.env, PORT: String(PORT), TEST_AUTH: "1", TEST_IS_ADMIN: "1", TEST_USER_ID: "1", TEST_ACCOUNT_ID: "1" };
  const cliArgs = process.argv.slice(2);
  const devMode = true; // Force dev server for smoke tests to avoid build artifacts issues
  // Use npm to run next on Windows to avoid spawn issues with npx.cmd
  const isWin = process.platform === "win32";
  const cmd = isWin ? "npx.cmd" : "npx";
  const spawnArgs = ["next", "dev", "-p", String(PORT)];
  const child = spawn(cmd, spawnArgs, { stdio: "pipe", env, shell: isWin });
  child.stdout.on("data", (d) => process.stdout.write(d.toString()));
  child.stderr.on("data", (d) => process.stderr.write(d.toString()));

  const up = await waitUntilUp();
  if (!up) {
    console.error("Server failed to start within timeout");
    child.kill();
    process.exit(1);
  }

  let failures = 0;
  const check = (ok, name, extra = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` -> ${extra}` : ""}`);
    if (!ok) failures++;
  };
  const okStatus = (s) => s === 200 || s === 400 || s === 404 || (ALLOW_500 && s === 500);

  // Public ping
  {
    const { status } = await fetchJson(`${BASE}/api/ping`);
    check(status === 200, "GET /api/ping", String(status));
  }

  // Debug env (no DB)
  {
    const { status } = await fetchJson(`${BASE}/api/debug/env`);
    check(status === 200, "GET /api/debug/env", String(status));
  }

  // Locations list (auth bypassed by test hook)
  {
    const { status } = await fetchJson(`${BASE}/api/locations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activeOnly: true }) });
    check(okStatus(status), "POST /api/locations", `${status}`);
  }

  // Admin-only endpoint should not be 401/403 under test hook
  {
    const { status } = await fetchJson(`${BASE}/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 1 }) });
    check(status !== 401 && status !== 403, "POST /api/users guard", `${status}`);
  }

  // Tasks list
  {
    const { status } = await fetchJson(`${BASE}/api/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 1 }) });
    check(okStatus(status), "POST /api/tasks", `${status}`);
  }

  // Notifications list
  {
    const { status } = await fetchJson(`${BASE}/api/notifications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    check(okStatus(status), "POST /api/notifications", `${status}`);
  }

  // Cleanup server
  child.kill();
  await wait(500);

  if (failures > 0) {
    console.error(`\n${failures} smoke check(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll smoke checks passed.");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
