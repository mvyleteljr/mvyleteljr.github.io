const fs = require("fs");
const { EventEmitter } = require("events");

function loadEnv() {
  const raw = fs.readFileSync(".env", "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eq = trimmed.indexOf("=");
    if (eq === -1) return;

    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

function localDateKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const values = {};
  parts.forEach((part) => {
    values[part.type] = part.value;
  });
  return `${values.year}-${values.month}-${values.day}`;
}

function makeReq(method, url, body, token) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { host: "localhost" };
  if (token) req.headers.authorization = `Bearer ${token}`;
  req.body = body;
  return req;
}

function call(handler, req) {
  return new Promise((resolve) => {
    const chunks = [];
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name.toLowerCase()] = value;
      },
      end(chunk) {
        if (chunk) chunks.push(Buffer.from(chunk));
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve({
          statusCode: this.statusCode,
          body: raw ? JSON.parse(raw) : {}
        });
      }
    };
    handler(req, res);
  });
}

async function main() {
  loadEnv();

  const required = [
    "DATABASE_URL",
    "CHALLENGE_PASSCODE",
    "CHALLENGE_SESSION_SECRET"
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`missing ${missing.join(", ")}`);
  }

  process.env.CHALLENGE_ID_OVERRIDE = "positive-monitor-smoke";
  process.env.CHALLENGE_START_DATE_OVERRIDE = localDateKey(
    new Date(),
    process.env.CHALLENGE_TIMEZONE || "America/New_York"
  );
  process.env.CHALLENGE_ALLOWED_NAMES = "Marshall,Tripp";
  const marker = `smoke test ${new Date().toISOString()}`;

  const handler = require("../api/challenge");
  const login = await call(handler, makeReq("POST", "/api/challenge?action=login", {
    name: "Marshall",
    passcode: process.env.CHALLENGE_PASSCODE
  }));
  if (login.statusCode !== 200 || !login.body.token) {
    throw new Error(`login failed: ${login.body.error || login.statusCode}`);
  }

  const before = await call(
    handler,
    makeReq("GET", "/api/challenge?action=entries", null, login.body.token)
  );
  if (before.statusCode !== 200) {
    throw new Error(`entries read failed: ${before.body.error || before.statusCode}`);
  }

  const created = await call(
    handler,
    makeReq("POST", "/api/challenge?action=entries", {
      body: marker,
      media: [{ kind: "url", url: "https://example.com/smoke" }]
    }, login.body.token)
  );
  if (created.statusCode !== 200) {
    throw new Error(`entry create failed: ${created.body.error || created.statusCode}`);
  }

  const afterCount = created.body.entries.filter((entry) => entry.body === marker).length;
  if (afterCount < 1) {
    throw new Error("smoke entry was not returned");
  }

  const entry = created.body.entries
    .filter((item) => item.body === marker)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const updated = await call(
    handler,
    makeReq("PUT", "/api/challenge?action=entry", {
      id: entry.id,
      body: `updated smoke test ${new Date().toISOString()}`,
      media: entry.media
    }, login.body.token)
  );
  if (updated.statusCode !== 200) {
    throw new Error(`entry update failed: ${updated.body.error || updated.statusCode}`);
  }

  console.log("challenge API smoke test passed");
  console.log(`current day: ${updated.body.currentDay}`);
  console.log(`smoke entries visible: ${afterCount}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
