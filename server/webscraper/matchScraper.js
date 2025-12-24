/**
 * Scrape TennisExplorer "match-detail" pages:
 * - date/time (GMT+1; supports "Today, HH:MM")
 * - court type (e.g., "indoors")
 * - optional final score (match score + set score line if present)
 * - each player's info: name, birthdate, height, weight, plays, imageUrl
 * - average betting odds (from the "Average odds" row in the odds table)
 */

import * as cheerio from "cheerio";
import { CONFIG } from "./config.js";

const BASE = CONFIG.BASE_URL;

// --- networking ---
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return await res.text();
}

// --- helpers ---
function absolutizeUrl(maybeRelative) {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, BASE).toString();
  } catch {
    return maybeRelative;
  }
}

function parseIdFromMatchDetailUrl(url) {
  const u = new URL(url);
  return u.searchParams.get("id");
}

/**
 * TennisExplorer displays match times in GMT+1.
 * If the page says "Today, HH:MM", we must compute "today" in GMT+1.
 */
function todayDateInGmtPlus1() {
  // Shift current time by +1 hour relative to UTC, then read with UTC getters.
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // ISO date
}

function parseMetaLine(metaLineRaw) {
  const parts = metaLineRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const dateToken = parts[0] ?? null;
  const time = parts[1] ?? null;
  const courtType = parts.length ? parts[parts.length - 1] : null;

  let dateISO = null;
  if (dateToken) {
    if (/^today$/i.test(dateToken)) {
      dateISO = todayDateInGmtPlus1();
    } else {
      // "DD.MM.YYYY"
      const m = dateToken.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (m) {
        const dd = String(m[1]).padStart(2, "0");
        const mm = String(m[2]).padStart(2, "0");
        const yyyy = m[3];
        dateISO = `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  const datetimeGmtPlus1 =
    dateISO && time ? `${dateISO}T${time}:00+01:00` : null;

  return { dateISO, time, timezone: "GMT+1", datetimeGmtPlus1, courtType };
}

function cleanCellText(s) {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t === "-" ? null : t;
}

/**
 * Finds the first table that looks like the 3-column player info grid:
 * left value | label | right value
 */
function findPlayerInfoTable($) {
  const tables = $("table").toArray();
  for (const t of tables) {
    const txt = $(t).text();
    if (txt.includes("Birthdate") && txt.includes("Plays")) return t;
  }
  return null;
}

function parseBirthdateToDate(birthdateStr) {
  if (!birthdateStr) return null;

  const s = String(birthdateStr).trim();

  // Accept: "12.8.1998", "12. 8. 1998", "12 . 8 . 1998"
  const m = s.match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})$/);
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]) - 1; // 0-based in JS
  const year = Number(m[3]);

  // Basic validation
  if (
    !Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year) ||
    day < 1 || day > 31 || month < 0 || month > 11 || year < 1800 || year > 3000
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month, day));
}


function parsePlayersFromInfoTable($, tableEl) {
  let playerLinks = $(tableEl).find('a[href*="/player/"]').toArray();

  if (playerLinks.length < 2) {
    playerLinks = $(tableEl).parent().find('a[href*="/player/"]').toArray();
  }

  const unique = [];
  const seen = new Set();
  for (const a of playerLinks) {
    const href = $(a).attr("href");
    const name = cleanCellText($(a).text());
    if (!href || !name) continue;
    const key = `${href}|${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({ name, profileUrl: absolutizeUrl(href) });
    if (unique.length === 2) break;
  }

  const p1 = {
    name: unique[0]?.name ?? null,
    birthdate: null,
    height: null,
    weight: null,
    plays: null,
    imageUrl: null,
  };
  const p2 = {
    name: unique[1]?.name ?? null,
    birthdate: null,
    height: null,
    weight: null,
    plays: null,
    imageUrl: null,
  };

  $(tableEl)
    .find("tr")
    .each((_, tr) => {
      const tds = $(tr)
        .find("td,th")
        .toArray()
        .map((c) => cleanCellText($(c).text()));

      if (tds.length < 3) return;

      const label = (tds[1] ?? "").toLowerCase();
      const leftVal = tds[0] ?? null;
      const rightVal = tds[2] ?? null;

      if (label.includes("birthdate")) {
        p1.birthdate = parseBirthdateToDate(leftVal);
        p2.birthdate = parseBirthdateToDate(rightVal);
      } else if (label.includes("height")) {
        p1.height = leftVal;
        p2.height = rightVal;
      } else if (label.includes("weight")) {
        p1.weight = leftVal;
        p2.weight = rightVal;
      } else if (label.includes("plays")) {
        p1.plays = leftVal;
        p2.plays = rightVal;
      }
    });

  return [p1, p2];
}

/**
 * NEW: TennisExplorer player photos are usually /res/img/player/...
 * Grab the first two distinct ones and map them to player1/player2.
 */
function extractPlayerImageUrls($) {
  const imgs = $('img[src*="/res/img/player/"]')
    .toArray()
    .map((img) => absolutizeUrl($(img).attr("src")))
    .filter(Boolean);

  const out = [];
  const seen = new Set();
  for (const u of imgs) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
    if (out.length === 2) break;
  }
  return out; // [img1, img2]
}

function extractMetaLineText($) {
  const h1 = $("h1").first();
  const candidates = h1
    .nextAll()
    .toArray()
    .map((el) => $(el).text().replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const meta = candidates.find((t) => /^today,\s*\d{1,2}:\d{2}/i.test(t));
  if (meta) return meta;

  const meta2 = candidates.find((t) =>
    /^\d{1,2}\.\d{1,2}\.\d{4},\s*\d{1,2}:\d{2}/.test(t)
  );
  return meta2 || null;
}

function extractFinalScore($) {
  // TennisExplorer shows the final score in a cell with class "gScore"
  const raw = $(".gScore").first().text().trim();
  if (!raw) return null;

  // Grab only the first "X : Y" part (with optional spaces)
  const m = raw.match(/(\d+)\s*:\s*(\d+)/);
  if (!m) return null;

  return `${m[1]}:${m[2]}`; // "3:0"
}


/**
 * NEW: Don’t compute odds — read the "Average odds" row directly.
 * Returns: { homeAvg, awayAvg } or null.
 */
function extractAverageOddsRow($) {
  const tables = $("table").toArray();

  for (const t of tables) {
    const $t = $(t);
    const tableText = $t.text().toLowerCase();

    // Odds tables typically contain "odds" or "opening odds"
    if (!tableText.includes("odds")) continue;

    const rows = $t.find("tr").toArray();
    for (const tr of rows) {
      const tds = $(tr).find("td").toArray();
      if (tds.length < 3) continue;

      const label = cleanCellText($(tds[0]).text())?.toLowerCase() ?? "";
      if (!label.includes("average")) continue;

      // Get first two numeric values after the label
      const nums = tds
        .slice(1)
        .map((td) => cleanCellText($(td).text()))
        .filter((x) => x && /^\d+(\.\d+)?$/.test(x))
        .map(Number);

      if (nums.length >= 2) {
        return { homeAvg: nums[0], awayAvg: nums[1] };
      }
    }
  }

  return null;
}

// --- main scrape ---
export async function scrapeMatch(match_id) {
  const url = `${CONFIG.MATCH_URL}${match_id}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const id = parseIdFromMatchDetailUrl(url);

  const rawTitle = $("h1").first().text().replace(/\s+/g, " ").trim();
  const matchName = rawTitle.replace(/^#\s*/, "").trim() || null;

  const metaLine = extractMetaLineText($);
  const meta = metaLine ? parseMetaLine(metaLine) : null;

  const infoTable = findPlayerInfoTable($);
  const players = infoTable
    ? parsePlayersFromInfoTable($, infoTable)
    : [null, null];

  // NEW: Attach correct /res/img/player/ images
  const [img1, img2] = extractPlayerImageUrls($);
  if (players[0]) players[0].imageUrl = img1 ?? null;
  if (players[1]) players[1].imageUrl = img2 ?? null;

  // NEW: Read the "Average odds" row directly
  const averageOdds = extractAverageOddsRow($);

  const finalScore = extractFinalScore($);

  return {
    id,
    url,
    matchName,
    date: meta?.dateISO ?? null,
    time: meta?.time ?? null,
    timezone: meta?.timezone ?? "GMT+1",
    datetime: meta?.datetimeGmtPlus1 ?? null,
    courtType: meta?.courtType ?? null,
    players: players.filter(Boolean),
    averageBettingOdds: averageOdds, // { homeAvg, awayAvg } or null
    finalScore, // null if not detected
  };
}
