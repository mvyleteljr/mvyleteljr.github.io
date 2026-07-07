const crypto = require("crypto");
const { neon } = require("@neondatabase/serverless");

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_BODY_LENGTH = 5000;
const MAX_MEDIA_ITEMS = 12;
const MAX_MEDIA_LENGTH = 4000000;

let sql;
let ready;

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing ${name}`);
  return value;
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function setCors(req, res) {
  const allowed = process.env.CHALLENGE_ALLOWED_ORIGIN;
  const origin = req.headers.origin;
  if (allowed && origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(data) {
  return crypto
    .createHmac("sha256", env("CHALLENGE_SESSION_SECRET"))
    .update(data)
    .digest("base64url");
}

function makeToken(payload) {
  const data = base64url(JSON.stringify(payload));
  return `${data}.${sign(data)}`;
}

function readToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) throw new Error("not signed in");

  const parts = match[1].split(".");
  if (parts.length !== 2) throw new Error("bad token");

  const expected = sign(parts[0]);
  const given = parts[1];
  if (
    expected.length !== given.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))
  ) {
    throw new Error("bad token");
  }

  const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Date.now()) throw new Error("session expired");
  return payload;
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

function dateKeyTime(dateKey) {
  const parts = dateKey.split("-").map(Number);
  return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function challengeState() {
  const startDate = env("CHALLENGE_START_DATE");
  const timeZone = process.env.CHALLENGE_TIMEZONE || "America/New_York";
  const today = localDateKey(new Date(), timeZone);
  const currentDay = Math.floor((dateKeyTime(today) - dateKeyTime(startDate)) / DAY_MS) + 1;

  return {
    challengeId: process.env.CHALLENGE_ID || "positive-monitor",
    startDate,
    timeZone,
    today,
    currentDay
  };
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 6500000) {
        reject(new Error("request too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function initDb() {
  if (!sql) sql = neon(env("DATABASE_URL"));
  if (!ready) {
    ready = (async () => {
      await sql`create extension if not exists pgcrypto`;
      await sql`
        create table if not exists challenge_entries (
          id uuid primary key default gen_random_uuid(),
          challenge_id text not null,
          day integer not null check (day between 1 and 30),
          author text not null,
          body text not null default '',
          media jsonb not null default '[]'::jsonb,
          created_at timestamptz not null default now()
        )
      `;
      await sql`
        create index if not exists challenge_entries_challenge_day_created_idx
        on challenge_entries (challenge_id, day, created_at)
      `;
    })();
  }
  await ready;
}

async function getEntries(state) {
  const rows = await sql`
    select id, day, author, body, media, created_at
    from challenge_entries
    where challenge_id = ${state.challengeId}
    order by day asc, created_at asc
  `;

  return {
    startDate: state.startDate,
    timeZone: state.timeZone,
    today: state.today,
    currentDay: state.currentDay,
    entries: rows
  };
}

function cleanName(name) {
  const value = String(name || "").trim().slice(0, 40);
  if (!value) throw new Error("name required");

  const allowed = (process.env.CHALLENGE_ALLOWED_NAMES || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.includes(value.toLowerCase())) {
    throw new Error("name not allowed");
  }

  return value;
}

function validateMedia(media) {
  if (!Array.isArray(media)) throw new Error("media must be a list");
  if (media.length > MAX_MEDIA_ITEMS) throw new Error("too many media items");

  let totalLength = 0;
  return media.map((item) => {
    if (!item || typeof item !== "object") throw new Error("bad media item");

    if (item.kind === "url") {
      const url = String(item.url || "").trim();
      if (!/^https?:\/\//i.test(url)) throw new Error("media link must be http or https");
      if (url.length > 2000) throw new Error("media link is too long");
      return { kind: "url", url };
    }

    if (item.kind === "file") {
      const name = String(item.name || "file").trim().slice(0, 140);
      const type = String(item.type || "application/octet-stream").trim().slice(0, 120);
      const dataUrl = String(item.dataUrl || "");
      totalLength += dataUrl.length;

      if (!dataUrl.startsWith("data:")) throw new Error("bad file data");
      if (/svg|html/i.test(type)) throw new Error("that file type is not accepted");
      if (dataUrl.length > MAX_MEDIA_LENGTH || totalLength > MAX_MEDIA_LENGTH) {
        throw new Error("media is too large");
      }

      return { kind: "file", name, type, dataUrl };
    }

    throw new Error("bad media item");
  });
}

async function login(req, res) {
  const body = await parseBody(req);
  const expected = env("CHALLENGE_PASSCODE");
  if (String(body.passcode || "") !== expected) {
    json(res, 401, { error: "wrong passcode" });
    return;
  }

  const name = cleanName(body.name);
  const token = makeToken({
    name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 60
  });

  json(res, 200, { token });
}

async function createEntry(req, res, user, state) {
  if (state.currentDay < 1 || state.currentDay > 30) {
    json(res, 403, { error: "today is not open" });
    return;
  }

  const input = await parseBody(req);
  const body = String(input.body || "").trim().slice(0, MAX_BODY_LENGTH);
  const media = validateMedia(input.media || []);
  if (!body && !media.length) {
    json(res, 400, { error: "write something or add media" });
    return;
  }

  await sql`
    insert into challenge_entries (challenge_id, day, author, body, media)
    values (
      ${state.challengeId},
      ${state.currentDay},
      ${user.name},
      ${body},
      cast(${JSON.stringify(media)} as jsonb)
    )
  `;

  json(res, 200, await getEntries(state));
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const action = url.searchParams.get("action");

    if (action === "login" && req.method === "POST") {
      await login(req, res);
      return;
    }

    const user = readToken(req);
    const state = challengeState();
    await initDb();

    if (action === "entries" && req.method === "GET") {
      json(res, 200, await getEntries(state));
      return;
    }

    if (action === "entries" && req.method === "POST") {
      await createEntry(req, res, user, state);
      return;
    }

    json(res, 404, { error: "not found" });
  } catch (error) {
    json(res, 400, { error: error.message || "request failed" });
  }
};
