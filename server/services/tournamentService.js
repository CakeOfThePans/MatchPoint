import {
	scrapeAtpTournaments,
	scrapeTournamentInfo,
} from '../webscraper/tournamentScraper.js'
import prisma from '../lib/prisma.js'
import { formatCourtType } from '../utils/matchUtils.js'

// Updates or creates tournaments from the tournaments page.
// Returns list of objects containing tournament name, id, and url.
export const updateTournaments = async () => {
	try {
		// Scrape tournaments from the page
		const scrapedTournaments = await scrapeAtpTournaments()
		// Add a delay of anywhere between 3-7 seconds
		await new Promise((resolve) =>
			setTimeout(resolve, Math.random() * 4000 + 3000)
		)

		const result = []

		// Update or create each tournament
		for (const tournament of scrapedTournaments) {
			// Scrape surface type from the tournament page
			const tournamentInfo = await scrapeTournamentInfo(tournament.url)
			const surfaceType = tournamentInfo.surface

			// Check if tournament exists
			const existingTournament = await prisma.tournament.findFirst({
				where: {
					tournament_name: tournamentInfo.name,
				},
			})

			let savedTournament
			if (existingTournament) {
				// Update existing tournament
				savedTournament = await prisma.tournament.update({
					where: {
						tournament_id: existingTournament.tournament_id,
					},
					data: {
						last_updated: new Date(),
					},
				})
			} else {
				// Create new tournament
				savedTournament = await prisma.tournament.create({
					data: {
						tournament_name: tournamentInfo.name,
						surface_type: formatCourtType(surfaceType),
						is_grand_slam: false, // Default to false, manually update later if needed
						last_updated: new Date(),
					},
				})
			}

			result.push({
				tournament_name: savedTournament.tournament_name,
				tournament_id: savedTournament.tournament_id,
				url: tournament.url,
			})

			// Add a delay of anywhere between 3-7 seconds
			await new Promise((resolve) =>
				setTimeout(resolve, Math.random() * 4000 + 3000)
			)
		}

		console.log(`Updated ${result.length} tournaments`)
		return result
	} catch (error) {
		console.error('Error in updating tournaments:', error)
		throw error
	}
}
