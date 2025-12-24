import { scrapeAtpTournaments, scrapeTournamentInfo } from '../webscraper/tournamentScraper.js'
import prisma from '../lib/prisma.js'
import { formatCourtType } from '../utils/matchUtils.js'


// Upserts tournaments from the tournaments page.
// Returns list of objects containing tournament name, id, and url.
export const updateTournaments = async () => {
	try {
		// Scrape tournaments from the page
		const scrapedTournaments = await scrapeAtpTournaments()

		const result = []

		// Upsert each tournament
		for (const tournament of scrapedTournaments) {
			// Scrape surface type from the tournament page
			const tournamentInfo = await scrapeTournamentInfo(tournament.url)
			const surfaceType = tournamentInfo.surface
			const upserted = await prisma.tournament.upsert({
				where: {
					tournament_name: tournamentInfo.name,
				},
				update: {
					last_updated: new Date(),
				},
				create: {
					tournament_name: tournamentInfo.name,
					surface_type: formatCourtType(surfaceType),
					is_grand_slam: false, // Default to false, manually update later if needed
					last_updated: new Date(),
				},
			})

			result.push({
				tournament_name: upserted.tournament_name,
				tournament_id: upserted.tournament_id,
				url: tournament.url,
			})
		}

		console.log(`Updated ${result.length} tournaments`)
		return result
	} catch (error) {
		console.error('Error in updating tournaments:', error)
		throw error
	}
}
