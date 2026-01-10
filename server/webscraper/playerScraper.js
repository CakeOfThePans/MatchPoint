/**
 * Scrape TennisExplorer player pages that contain:
 * <table class="plDetail"> ... <div class="date">Age: 24 (16. 8. 2001)</div> ...
 *
 * Returns:
 * {
 *   url,
 *   name,
 *   birthdate, // Date (UTC) or null
 *   height,    // string or null (e.g. "188 cm")
 *   weight,    // string or null (e.g. "76 kg")
 *   plays,     // string or null (e.g. "right")
 *   imageUrl   // absolute url or null
 * }
 */

import * as cheerio from "cheerio";
import { CONFIG } from "./config.js";

const BASE = CONFIG.BASE_URL;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return await res.text();
}

function absolutizeUrl(maybeRelative) {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, BASE).toString();
  } catch {
    return maybeRelative;
  }
}

function cleanText(s) {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t === "" || t === "-" ? null : t;
}

function parseBirthdateToDate(dotted) {
  // "16. 8. 2001" or "16.8.2001"
  const m = String(dotted ?? "")
    .trim()
    .match(/^(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})$/);
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);

  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    !Number.isFinite(year) ||
    day < 1 ||
    day > 31 ||
    month < 0 ||
    month > 11 ||
    year < 1800 ||
    year > 3000
  ) {
    return null;
  }

  return new Date(Date.UTC(year, month, day));
}

function parseBirthdateFromAgeLine(lineValue) {
  // "24 (16. 8. 2001)" -> capture inside parentheses
  const s = cleanText(lineValue);
  if (!s) return null;

  const m = s.match(/\((\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{4})\)/);
  if (!m) return null;

  return parseBirthdateToDate(m[1]);
}

/**
 * Read the player details block inside table.plDetail:
 * <div class="date">Key: Value</div>
 */
function parsePlDetail($) {
  const $table = $("table.plDetail").first();
  if (!$table.length) {
    throw new Error('Could not find table.plDetail (site HTML may have changed).');
  }

  const name =
    cleanText($table.find("h3").first().text()) ||
    cleanText($("h3").first().text()) ||
    null;

  const imgSrc =
    $table.find('td.photo img').first().attr("src") ||
    $table.find('img').first().attr("src") ||
    null;

  const imageUrl = absolutizeUrl(imgSrc);

  // Build a map from "key" -> "value" for div.date lines
  const info = new Map();
  $table.find("div.date").each((_, el) => {
    const raw = cleanText($(el).text());
    if (!raw) return;

    // split at the first colon
    const idx = raw.indexOf(":");
    if (idx === -1) return;

    const key = cleanText(raw.slice(0, idx))?.toLowerCase();
    const value = cleanText(raw.slice(idx + 1));
    if (!key) return;

    info.set(key, value);
  });

  // Height / Weight: "188 cm / 76 kg"
  let height = null;
  let weight = null;
  const hw = info.get("height / weight");
  if (hw) {
    const parts = hw.split("/").map((p) => cleanText(p));

    // Remove non-numeric characters (keeps digits only)
    height = parts[0] ? parts[0].replace(/[^\d.]/g, "") : null;
    weight = parts[1] ? parts[1].replace(/[^\d.]/g, "") : null;

    if (height === "") height = null;
    if (weight === "") weight = null;
  }

  // Age: "24 (16. 8. 2001)"
  const birthdate = parseBirthdateFromAgeLine(info.get("age"));

  const plays = info.get("plays") ?? null;

  return { name, birthdate, height, weight, plays, imageUrl };
}

export async function scrapePlayer(playerUrlOrPath) {
  const url = absolutizeUrl(playerUrlOrPath);
  if (!url) throw new Error("scrapePlayer: missing player URL/path");

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const { name, birthdate, height, weight, plays, imageUrl } = parsePlDetail($);

  return {
    url,
    name,
    birthdate: birthdate ?? null,
    height: height ?? null,
    weight: weight ?? null,
    plays: plays ?? null,
    imageUrl: imageUrl ?? null,
  };
}
