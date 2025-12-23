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

function extractTournamentInfo(html) {
  const $ = cheerio.load(html);
  let text = $("#center").text().toLowerCase();

  const output = {}
  // Extract surface type
  const surfaces = ["hard", "grass", "clay", "indoors"];
  for (const surface of surfaces) {
    if (text.includes(surface)) {
      output.surface = surface;
    }
  }

  // Extract tournament name and year
  text = $("#center h1").first().text().trim();

  // Extract year (4 digits)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  output.year = Number(yearMatch[0]);

  // Remove anything in parentheses
  text = text.replace(/\s*\([^)]*\)\s*/g, "").trim();

  // Remove trailing year
  text = text.replace(/\s+\d{4}$/, "").trim();
  output.name = text;


  // Extract last match date
  const resultsTable = $("#center").find("table.result").first();

  // Date/time cell looks like: <td class="first time">21.12.<br>17:10</td>
  const firstDateCell = resultsTable.find("td.first.time").first().text().trim();

  // Parse date
  output.last_match_date = parseMatchDate(firstDateCell, output.year);
  return output;
}


// Converts "DD.MM." to dates + given the year
function parseMatchDate(cellText, year) {
  if (!cellText || !year) return new Date(); // If no date is found, return today's date

  // Normalize whitespace
  const text = cellText.replace(/\s+/g, " ").trim();

  // Match "DD.MM."
  const m = text.match(/(\d{1,2})\.(\d{1,2})\./);
  if (!m) return new Date(); // If no date is found, return today's date

  const day = Number(m[1]);
  const month = Number(m[2]) - 1; // JS months are 0-based

  return new Date(year, month, day);
  
}

export async function scrapeTournamentInfo(url) {
  const html = await fetchHtml(url);
  return extractTournamentInfo(html);
}