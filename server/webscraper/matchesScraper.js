import * as cheerio from "cheerio";
import { CONFIG } from "./config.js";

const BASE = CONFIG.BASE_URL;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function extractIdFromMatchUrl(matchUrl) {
  const u = new URL(matchUrl);
  return u.searchParams.get("id"); // e.g. "3099166"
}

function extractNextMatches(html) {
  // Slice the HTML to just the "Next matches" section (much more robust than DOM sibling walking)
  const startIdx = html.indexOf("Next matches");
  if (startIdx === -1) return [];

  const endIdx = html.indexOf("Results", startIdx);
  const sectionHtml =
    endIdx === -1 ? html.slice(startIdx) : html.slice(startIdx, endIdx);

  const $ = cheerio.load(sectionHtml);

  const matches = [];
  const seen = new Set();

  // Links look like /match-detail/?id=...
  $('a[href*="match-detail/?id="]').each((_, a) => {
    const matchName = $(a).text().trim();
    const href = $(a).attr("href");
    if (!href || !matchName) return;

    const url = new URL(href, BASE).toString();
    const id = extractIdFromMatchUrl(url);
    if (!id) return;

    const key = `${id}|${matchName}`;
    if (seen.has(key)) return;
    seen.add(key);

    matches.push({ matchName, url, id });
  });

  return matches;
}

export async function scrapeNextMatches(url) {
  const html = await fetchHtml(url);
  const nextMatches = extractNextMatches(html);
  return nextMatches;
}

function extractMatchResultsIds(html) {
  const $ = cheerio.load(html);
  const resultsTable = $("#center").find("table.result").first();
  if (!resultsTable.length) return [];

  const ids = new Set();

  // Every completed match has exactly one info link
  resultsTable.find('a[href*="match-detail/?id="]').each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    const id = extractIdFromMatchUrl(new URL(href, BASE).toString());
    if (id) ids.add(id);
  });

  return [...ids];
}

export async function scrapeMatchResultsIds(url) {
  const html = await fetchHtml(url);
  const matchResultsIds = extractMatchResultsIds(html);
  return matchResultsIds;
}