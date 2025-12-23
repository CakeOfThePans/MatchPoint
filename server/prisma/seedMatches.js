import { PrismaClient } from '@prisma/client'
import { scrapeMatchResultsIds } from '../webscraper/matchesScraper.js'
import { scrapeTournamentInfo } from '../webscraper/tournamentScraper.js'
import { updateMatchAndPlayers } from '../services/matchService.js'
import { formatCourtType } from '../utils/matchUtils.js'
import {
	updateOverallMLResults,
	updateMLResultsByTournament,
} from '../services/mlResultService.js'
import 'dotenv/config'

const prisma = new PrismaClient()

const tournamentURL = process.argv[2] || null

async function main() {
	if (!tournamentURL) {
		console.error('Tournament URL is required')
		process.exit(1)
	}

	// Update tournament info
	const tournamentInfo = await scrapeTournamentInfo(tournamentURL)

	// Check if tournament exists first to avoid auto-increment issues
	let tournament = await prisma.tournament.findUnique({
		where: {
			tournament_name: tournamentInfo.name,
		},
	})

	if (tournament) {
		// Update existing tournament
		tournament = await prisma.tournament.update({
			where: {
				tournament_id: tournament.tournament_id,
			},
			data: {
				last_updated: tournamentInfo.last_match_date,
			},
		})
	} else {
		// Create new tournament
		tournament = await prisma.tournament.create({
			data: {
				tournament_name: tournamentInfo.name,
				surface_type: formatCourtType(tournamentInfo.surface),
				is_grand_slam: false,
				last_updated: tournamentInfo.last_match_date,
			},
		})
	}
	console.log(`Updated tournament: ${tournament.tournament_name}`)

	// Update match results
	const matchIds = await scrapeMatchResultsIds(tournamentURL)
	console.log(`Found ${matchIds.length} match results to update`)
	for (const matchId of matchIds) {
		await updateMatchAndPlayers(matchId, tournament.tournament_id)
		// add a delay of anywhere between 3-7 seconds
		await new Promise((resolve) =>
			setTimeout(resolve, Math.random() * 4000 + 3000)
		)
	}
	console.log(`Updated ${matchIds.length} match results`)

	// Update ML results
	await updateOverallMLResults()
	await updateMLResultsByTournament(tournament.tournament_id)
	console.log(`Updated ML results`)
	console.log(`Seed matches completed successfully`)
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
