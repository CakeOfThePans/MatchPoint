import { scrapeAtpRankings } from '../webscraper/rankingsScraper.js'
import { scrapePlayer } from '../webscraper/playerScraper.js'

async function main() {
  const playerInfo = await scrapePlayer("https://www.tennisexplorer.com/player/sinner-8b8e8/")
  console.log(playerInfo)
}

main()