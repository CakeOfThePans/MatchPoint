import * as cheerio from "cheerio";
import { CONFIG } from "./config.js";

const BASE = CONFIG.BASE_URL;
const URL = CONFIG.TOURNAMENT_URL;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.text();
}

function extractMainTournaments(html) {
  const $ = cheerio.load(html);

  // Find the node that contains "This week's tournaments"
  const headerNode = $(":contains(\"This week's tournaments\")").filter(function () {
    // keep it relatively tight: prefer header-ish tags
    const tag = this.tagName?.toLowerCase();
    return tag === "h3" || tag === "div" || tag === "td" || tag === "b" || tag === "strong";
  }).first();

  if (!headerNode || headerNode.length === 0) {
    throw new Error(`Couldn't find "This week's tournaments" section`);
  }

  // We'll scan forward through siblings/descendants after the headerNode
  // by working in the parent container's text flow.
  const container = headerNode.parent();
  const containerHtml = container.html() ?? "";
  const $$ = cheerio.load(containerHtml);

  let inMain = false;
  const tournaments = [];

  $$("*").each((_, el) => {
    const text = $$(el).text().trim();

    if (text === "Main tournaments") {
      inMain = true;
      return;
    }

    if (text === "Lower level tournaments") {
      return false; // stop
    }

    if (inMain && el.tagName === "a") {
      const name = text;
      const href = $$(el).attr("href");
      if (name && href) {
        tournaments.push({
          name,
          url: href.startsWith("http") ? href : BASE + href,
        });
      }
    }
  });

  return tournaments;
}

function filterAtpMenOnly(tournaments) {
  return tournaments.filter((t) => {
    const n = t.name.toLowerCase();
    const url = t.url.toLowerCase();

    // Exclude women / WTA explicitly
    if (n.includes("wta") || n.includes("women") || n.includes("girls")) {
      return false;
    }

    // Explicitly require ATP men indicator in URL
    if (!url.includes("atp-men")) {
      return false;
    }

    // Keep ATP men tournaments
    return (
      n.includes("atp") ||         
      n.includes("masters") ||       
      n.includes("open") ||          
      n.includes("cup")              
    );
  });
}

export async function scrapeAtpTournaments() {
  const html = await fetchHtml(URL);
  const main = extractMainTournaments(html);
  const tournaments = filterAtpMenOnly(main);
  return tournaments;
}
