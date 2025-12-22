/**
 * Scrape TennisExplorer ATP rankings:
 * returns [{ rank: number, name: string, points: number }, ...]
 *
 * npm i cheerio
 * node scrape-atp-ranking.mjs
 */

import * as cheerio from "cheerio";
import { CONFIG } from "./config.js";

const BASE = CONFIG.BASE_URL;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "text/html",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return await res.text();
}

/**
 * Finds the ranking table by looking for a <table> whose header row includes:
 * "Rank", "Player name", and "Points"
 */
function findRankingTable($) {
  const tables = $("table").toArray();

  for (const el of tables) {
    const text = $(el).text();
    if (text.includes("Rank") && text.includes("Player name") && text.includes("Points")) {
      return $(el);
    }
  }
  return null;
}

function parseIntSafe(s) {
  const n = Number(String(s).replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseRankingRows(html) {
  const $ = cheerio.load(html);
  const table = findRankingTable($);
  if (!table) throw new Error("Could not find ranking table (site HTML may have changed).");

  const out = [];

  table.find("tr").each((_, tr) => {
    const $tr = $(tr);
    const tds = $tr.find("td");
    if (tds.length < 4) return; // skip headers / separators

    // Typical layout: [rank, move, player, country, points]
    const rankRaw = $(tds.eq(0)).text().trim();
    const name =
      $(tds.eq(2)).find("a").first().text().trim() ||
      $(tds.eq(2)).text().trim();

    // Points is usually last column
    const pointsRaw = $(tds.eq(tds.length - 1)).text().trim();

    // basic validation: rank looks like "1." and name exists
    const rank = parseIntSafe(rankRaw);
    const points = parseIntSafe(pointsRaw);

    if (!rank || !name || points === null) return;

    out.push({ rank, name, points });
  });

  return out
}

export async function scrapeAtpRankings(page = 1) {
  const url = `${CONFIG.RANKINGS_URL}${page}`;
  const html = await fetchHtml(url);
  return parseRankingRows(html);
}

