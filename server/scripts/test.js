import { scrapeTournamentInfo } from '../webscraper/tournamentScraper.js'

const temp = await scrapeTournamentInfo('https://www.tennisexplorer.com/united-cup/2026/atp-men/')
console.log(temp)