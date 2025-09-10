/* Auth guard tests via running Next dev and hitting HTTP endpoints.
  Uses TEST_AUTH to stub auth context in apiAccess.js without DB/next-auth. */

import { spawn } from "node:child_process";
import net from "node:net";

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.TEST_AUTH = "1";

let PORT = null;
let BASE = null;

function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, init) {
    const res = await fetch(url, init);
    let json = null;
    try {
        json = await res.json();
    } catch {}
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

async function findFreePort(preferred = null) {
    // If a port is explicitly provided via env, honor it and hope it's free.
    if (preferred) return preferred;
    // Ask OS for a free port by binding to 0
    await new Promise((resolve) => setTimeout(resolve, 0));
    return await new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.unref();
        srv.on("error", reject);
        srv.listen(0, "127.0.0.1", () => {
            const addr = srv.address();
            const port = typeof addr === "object" && addr ? addr.port : 0;
            srv.close(() => resolve(port));
        });
    });
}

async function withServer(env, fn) {
    // If something already runs on the port, reuse it (tests use per-request headers)
    let child = null;
    if (!PORT) {
        const preferred = Number(process.env.PORT || 0) || null;
        PORT = await findFreePort(preferred);
        BASE = `http://127.0.0.1:${PORT}`;
    }
    if (!(await waitUntilUp(1500))) {
        const isWin = process.platform === "win32";
        const cmd = isWin ? "npx.cmd" : "npx";
        const args = ["next", "dev", "-p", String(PORT)];
        child = spawn(cmd, args, {
            stdio: "pipe",
            env: { ...process.env, ...env },
            shell: isWin,
        });
        child.stdout.on("data", (d) => process.stdout.write(d.toString()));
        child.stderr.on("data", (d) => process.stderr.write(d.toString()));
        const up = await waitUntilUp();
        if (!up) {
            console.error("Server failed to start within timeout");
            if (child) child.kill();
            process.exit(1);
        }
    }
    try {
        return await fn(child);
    } finally {
        if (child) {
            child.kill();
            await wait(300);
        }
    }
}

async function testNonAdminForbidden() {
    return await withServer({}, async () => {
        const cases = [
            ["POST", "/api/locations/add", {}],
            ["POST", "/api/accounts/users/add", { account_id: 1, user_id: 2 }],
            [
                "POST",
                "/api/products/categories/add",
                { product_id: 1, category_id: 2 },
            ],
            [
                "POST",
                "/api/employees/assets/add",
                { employee_id: 1, asset_id: 2 },
            ],
            ["POST", "/api/users", {}],
            ["POST", "/api/audit/logs", {}],
            ["POST", "/api/employees", {}],
        ];
        let fails = 0;
        for (const [method, path, body] of cases) {
            const { status } = await fetchJson(`${BASE}${path}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-test-is-admin": "0",
                    "x-test-user-id": "123",
                    "x-test-account-id": "456",
                },
                body: JSON.stringify(body),
            });
            const ok = status === 403;
            console.log(
                `${
                    ok ? "PASS" : "FAIL"
                } non-admin forbidden: ${path} -> ${status}`
            );
            if (!ok) fails++;
        }
        return fails;
    });
}

async function testAdminAllowed() {
    return await withServer({}, async () => {
        const cases = [
            ["POST", "/api/locations/add", {}],
            ["POST", "/api/accounts/users/add", {}],
        ];
        let fails = 0;
        for (const [method, path, body] of cases) {
            const { status } = await fetchJson(`${BASE}${path}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-test-is-admin": "1",
                    "x-test-user-id": "1",
                    "x-test-account-id": "1",
                },
                body: JSON.stringify(body),
            });
            const ok = status !== 403 && status !== 401;
            console.log(
                `${
                    ok ? "PASS" : "FAIL"
                } admin allowed past guard: ${path} -> ${status}`
            );
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
        process.exit(0);
    }
})();
